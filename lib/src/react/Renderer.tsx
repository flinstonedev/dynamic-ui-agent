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
            return { color: '#6b7280', margin: 0 };
          case 'caption':
            return { fontSize: 12, color: '#6b7280', margin: 0 };
          default:
            return { margin: 0 };
        }
      }, [node.props.variant]);
      return <div style={style as any}>{node.props.text}</div>;
    }
    case 'button': {
      const { label, variant, actionId } = node.props;
      const style = useMemo(() => {
        const base: React.CSSProperties = {
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
        };
        switch (variant) {
          case 'secondary':
            return { ...base, background: '#f3f4f6', color: '#111827' };
          case 'danger':
            return { ...base, background: '#dc2626', color: 'white' };
          default:
            return { ...base, background: '#3b82f6', color: 'white' };
        }
      }, [variant]);
      return (
        <button
          onClick={() => actionId && onAction?.(actionId)}
          style={style}
        >
          {label}
        </button>
      );
    }
    case 'input': {
      const { name, label, placeholder, inputType, value, required } = node.props as any;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {label && <label htmlFor={name} style={{ fontSize: 14, fontWeight: 500 }}>{label}</label>}
          <input
            id={name}
            name={name}
            placeholder={placeholder}
            type={inputType}
            defaultValue={value as any}
            required={required}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: 14,
            }}
          />
        </div>
      );
    }
    case 'form': {
      const { title, fields, submitLabel, actionId } = node.props as any;
      return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
          {title && <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{title}</h3>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!actionId) return;
              const fd = new FormData(e.currentTarget);
              const payload = Object.fromEntries(fd.entries());
              onAction?.(actionId, payload);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {fields?.map((f: any) => (
              <Node key={f.id ?? Math.random()} node={f} onAction={onAction} />
            ))}
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                background: '#3b82f6',
                color: 'white',
                width: '100%',
              }}
            >
              {submitLabel ?? 'Submit'}
            </button>
          </form>
        </div>
      );
    }
    case 'list': {
      return (
        <ul style={{ listStyleType: 'disc', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {node.props.items.map((it: string, i: number) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    }
    case 'table': {
      const { columns, rows } = node.props as any;
      return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                {columns.map((c: any) => (
                  <th
                    key={c.key}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: 14,
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, idx: number) => (
                <tr key={idx}>
                  {columns.map((c: any) => (
                    <td
                      key={c.key}
                      style={{
                        padding: '12px',
                        fontSize: 14,
                        borderBottom: idx < rows.length - 1 ? '1px solid #e5e7eb' : 'none',
                      }}
                    >
                      {String(r[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'code': {
      const { language, code } = node.props as any;
      return (
        <pre
          style={{
            background: '#0f172a',
            color: '#f1f5f9',
            padding: 16,
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: 14,
          }}
        >
          <code>{code}</code>
        </pre>
      );
    }
    default:
      return null;
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
