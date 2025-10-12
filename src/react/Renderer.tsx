'use client';

import React, { useMemo } from 'react';
import type { UIElement, AgentResponse } from '../agent/schema.js';

export interface RendererProps {
  response: AgentResponse;
  onAction?: (actionId: string, payload?: unknown) => void;
}

export function DynamicUIRenderer({ response, onAction }: RendererProps) {
  const ui = response.ui;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{ui.map((n) => (
    <Node key={n.id ?? Math.random()} node={n} onAction={onAction} />
  ))}</div>;
}

function Node({ node, onAction }: { node: UIElement; onAction?: RendererProps['onAction'] }) {
  switch (node.type) {
    case 'container': {
      const { direction, gap, align, justify } = node.props;
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: direction,
            gap,
            alignItems: cssAlign(align),
            justifyContent: cssJustify(justify),
          }}
        >
          {'children' in node && node.children?.map((c: any) => (
            <Node key={c.id ?? Math.random()} node={c} onAction={onAction} />
          ))}
        </div>
      );
    }
    case 'heading': {
      const Tag = (`h${node.props.level ?? 2}` as unknown) as keyof JSX.IntrinsicElements;
      return <Tag>{node.props.text}</Tag>;
    }
    case 'text': {
      const style = useMemo(() => {
        switch (node.props.variant) {
          case 'muted':
            return { color: '#6b7280' };
          case 'caption':
            return { fontSize: 12, color: '#6b7280' };
          default:
            return {};
        }
      }, [node.props.variant]);
      return <p style={style as any}>{node.props.text}</p>;
    }
    case 'button': {
      const { label, variant, actionId } = node.props;
      return (
        <button
          onClick={() => actionId && onAction?.(actionId)}
          style={buttonStyle(variant)}
        >
          {label}
        </button>
      );
    }
    case 'input': {
      const { name, label, placeholder, inputType, value, required } = node.props as any;
      return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {label}
          <input
            name={name}
            placeholder={placeholder}
            type={inputType}
            defaultValue={value as any}
            required={required}
            style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
          />
        </label>
      );
    }
    case 'form': {
      const { title, fields, submitLabel, actionId } = node.props as any;
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!actionId) return;
            const fd = new FormData(e.currentTarget);
            const payload = Object.fromEntries(fd.entries());
            onAction?.(actionId, payload);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {title ? <h3>{title}</h3> : null}
          {fields?.map((f: any) => (
            <Node key={f.id ?? Math.random()} node={f} onAction={onAction} />
          ))}
          <button type="submit" style={buttonStyle('primary')}>
            {submitLabel ?? 'Submit'}
          </button>
        </form>
      );
    }
    case 'list': {
      return (
        <ul style={{ paddingLeft: 18 }}>
          {node.props.items.map((it: string, i: number) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    }
    case 'table': {
      const { columns, rows } = node.props as any;
      return (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {columns.map((c: any) => (
                <th key={c.key} style={cellStyle(true)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, idx: number) => (
              <tr key={idx}>
                {columns.map((c: any) => (
                  <td key={c.key} style={cellStyle(false)}>
                    {String(r[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case 'code': {
      const { language, code } = node.props as any;
      return (
        <pre style={{ background: '#0b1021', color: '#e4e7eb', padding: 12, borderRadius: 8, overflow: 'auto' }}>
          <code>{code}</code>
        </pre>
      );
    }
    default:
      return null;
  }
}

function buttonStyle(variant: 'primary' | 'secondary' | 'danger' | undefined): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: 'pointer',
  };
  switch (variant) {
    case 'secondary':
      return { ...base, background: 'white', borderColor: '#d1d5db', color: '#111827' };
    case 'danger':
      return { ...base, background: '#dc2626', color: 'white' };
    default:
      return { ...base, background: '#2563eb', color: 'white' };
  }
}

function cssAlign(a: 'start' | 'center' | 'end' | 'stretch') {
  switch (a) {
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'stretch':
      return 'stretch';
    default:
      return 'flex-start';
  }
}

function cssJustify(a: 'start' | 'center' | 'end' | 'between') {
  switch (a) {
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    default:
      return 'flex-start';
  }
}

function cellStyle(isHeader: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    textAlign: 'left',
  };
  if (isHeader) {
    return { ...base, fontWeight: 'bold', background: '#f9fafb' };
  }
  return base;
}
