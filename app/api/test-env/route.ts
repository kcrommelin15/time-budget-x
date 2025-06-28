import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    n8n_webhook_url: process.env.N8N_WEBHOOK_URL || 'NOT_SET',
    all_n8n_vars: Object.keys(process.env).filter(key => key.includes('N8N')),
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
  })
}