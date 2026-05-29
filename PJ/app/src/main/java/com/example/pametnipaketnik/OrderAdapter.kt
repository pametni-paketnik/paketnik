package com.example.pametnipaketnik

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.pametnipaketnik.databinding.ItemTimelineHeaderBinding
import com.example.pametnipaketnik.databinding.OrderItemsBinding

class OrderAdapter(
    private val orderList: List<TimelineItem>
): RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val TYPE_HEADER = 0
    private val TYPE_ORDER = 1

    override fun getItemViewType(position: Int): Int {
        return when (orderList[position]) {
            is HeaderItem -> TYPE_HEADER
            is Order -> TYPE_ORDER
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == TYPE_HEADER) {
            val binding = ItemTimelineHeaderBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            HeaderViewHolder(binding)
        } else {
            val binding = OrderItemsBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            OrderViewHolder(binding)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = orderList[position]) {
            is HeaderItem -> {
                val headerHolder = holder as HeaderViewHolder
                headerHolder.binding.textHeaderTitle.text = item.title
            }
            is Order -> {
                val orderHolder = holder as OrderViewHolder
                orderHolder.binding.textOrderId.text = "Naročilo: #${item.description}"
                orderHolder.binding.textLocation.text = "Lokacija: ${item.address}"
                orderHolder.binding.textStatus.text = "Status: ${item.status}"
            }
        }
    }

    override fun getItemCount(): Int {
        return orderList.size
    }
    class HeaderViewHolder(val binding: ItemTimelineHeaderBinding) : RecyclerView.ViewHolder(binding.root)
    class OrderViewHolder(val binding: OrderItemsBinding) : RecyclerView.ViewHolder(binding.root)
}
