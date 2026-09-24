export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    let setting = await prisma.setting.findFirst()
    if (!setting) {
      setting = await prisma.setting.create({
        data: { id: "1" }
      })
    }
    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}
