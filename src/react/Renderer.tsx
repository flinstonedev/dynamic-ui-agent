'use client';

import React, { useMemo } from 'react';
import type { UIElement, AgentResponse } from '../agent/schema.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { Label } from '../../components/ui/label.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.js';

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
      const buttonVariant = variant === 'secondary' ? 'secondary' : variant === 'danger' ? 'destructive' : 'default';
      return (
        <Button
          onClick={() => actionId && onAction?.(actionId)}
          variant={buttonVariant}
        >
          {label}
        </Button>
      );
    }
    case 'input': {
      const { name, label, placeholder, inputType, value, required } = node.props as any;
      return (
        <div className="space-y-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <Input
            id={name}
            name={name}
            placeholder={placeholder}
            type={inputType}
            defaultValue={value as any}
            required={required}
          />
        </div>
      );
    }
    case 'form': {
      const { title, fields, submitLabel, actionId } = node.props as any;
      return (
        <Card>
          {title && (
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!actionId) return;
                const fd = new FormData(e.currentTarget);
                const payload = Object.fromEntries(fd.entries());
                onAction?.(actionId, payload);
              }}
              className="space-y-4"
            >
              {fields?.map((f: any) => (
                <Node key={f.id ?? Math.random()} node={f} onAction={onAction} />
              ))}
              <Button type="submit" className="w-full">
                {submitLabel ?? 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    }
    case 'list': {
      return (
        <ul className="list-disc list-inside space-y-1">
          {node.props.items.map((it: string, i: number) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    }
    case 'table': {
      const { columns, rows } = node.props as any;
      return (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c: any) => (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any, idx: number) => (
                <TableRow key={idx}>
                  {columns.map((c: any) => (
                    <TableCell key={c.key}>{String(r[c.key] ?? '')}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    case 'code': {
      const { language, code } = node.props as any;
      return (
        <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-auto">
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
