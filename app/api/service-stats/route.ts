import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    const service_id = parseInt(serviceId)

    // Get average time for this service
    const { data: serviceData } = await supabase
      .from('services')
      .select('average_time')
      .eq('service_id', service_id)
      .single()

    // Get order statistics for this service
    const { data: ordersData } = await supabase
      .from('orders')
      .select('order_status, order_create')
      .eq('service_id', service_id)
      .order('order_create', { ascending: false })
      .limit(100)

    // Calculate status counts
    const stats = {
      pending: 0,
      processing: 0,
      inprogress: 0,
      completed: 0,
      partial: 0,
      canceled: 0,
      total: 0
    }

    // Group orders by date for the last 7 days
    const last7Days: { [key: string]: number } = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      last7Days[dateStr] = 0
    }

    // Calculate orders per day and status counts
    if (ordersData) {
      stats.total = ordersData.length
      
      ordersData.forEach((order: any) => {
        const status = order.order_status as keyof typeof stats
        if (stats[status] !== undefined) {
          stats[status]++
        }
        
        // Count orders per day
        const orderDate = new Date(order.order_create).toISOString().split('T')[0]
        if (last7Days[orderDate] !== undefined) {
          last7Days[orderDate]++
        }
      })
    }

    return NextResponse.json({
      averageTime: serviceData?.average_time || null,
      stats,
      last7Days: Object.entries(last7Days).map(([date, count]) => ({ date, count }))
    })

  } catch (error) {
    console.error('Error fetching service stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { serviceId } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    // Get completed orders for this service and calculate average completion time
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('order_create, order_finish')
      .eq('service_id', serviceId)
      .eq('order_status', 'completed')
      .not('order_finish', 'is', null)
      .not('order_create', 'is', null)

    let averageTime = null

    if (completedOrders && completedOrders.length > 0) {
      let totalMinutes = 0
      let validCount = 0

      completedOrders.forEach((order: any) => {
        const createTime = new Date(order.order_create).getTime()
        const finishTime = new Date(order.order_finish).getTime()
        
        if (!isNaN(createTime) && !isNaN(finishTime) && finishTime > createTime) {
          const diffMs = finishTime - createTime
          const diffMinutes = Math.floor(diffMs / 60000)
          totalMinutes += diffMinutes
          validCount++
        }
      })

      if (validCount > 0) {
        averageTime = Math.round(totalMinutes / validCount)
      }
    }

    // Update the service with average time
    await supabase
      .from('services')
      .update({ average_time: averageTime })
      .eq('service_id', serviceId)

    return NextResponse.json({ 
      success: true, 
      averageTime,
      sampleCount: completedOrders?.length || 0
    })

  } catch (error) {
    console.error('Error calculating average time:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
