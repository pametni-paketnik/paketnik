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
<<<<<<< Updated upstream
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
=======
        if (holder is HeaderViewHolder) {
            val headerItem = orderList[position] as HeaderItem
            holder.textTitle.text = headerItem.title
        }
        else if (holder is OrderViewHolder){
            val currentOrder = orderList[position] as Order
            val daysAgo = getDaysAgoCount(currentOrder.date)

            holder.binding.orderDate.text = currentOrder.date
            holder.binding.orderTitle.text = "Paketnik: ${currentOrder.boxId}"

            holder.binding.orderCardView.alpha = 1.0f
            holder.binding.itemIcon.alpha = 1.0f
            holder.binding.orderCardView.setOnClickListener(null)

            val statusLower = currentOrder.status.lowercase(Locale.getDefault())

            if (statusLower == "prevzeto") {
                holder.binding.orderAddress.text = "Status: PREVZETO"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#4CAF50"))

                holder.binding.orderCardView.alpha = 0.5f
                holder.binding.itemIcon.alpha = 0.25f
                holder.binding.orderCardView.setOnClickListener(null)

            } else if (daysAgo > 3 && statusLower != "prevzeto") {
                holder.binding.orderAddress.text = "Status: ZAPADEL ROK PREVZEMA"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#F44336"))

                holder.binding.orderCardView.alpha = 0.75f
                holder.binding.itemIcon.alpha = 0.4f
                holder.binding.orderCardView.setOnClickListener(null)

            } else {
                holder.binding.orderAddress.text = "Status: ODDANO V PAKETNIK"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#4CAF50"))

                holder.binding.orderCardView.setOnClickListener {
                    onOrderClick(currentOrder)
                }
>>>>>>> Stashed changes
            }
        }
    }

    override fun getItemCount(): Int {
        return orderList.size
    }
    class HeaderViewHolder(val binding: ItemTimelineHeaderBinding) : RecyclerView.ViewHolder(binding.root)
    class OrderViewHolder(val binding: OrderItemsBinding) : RecyclerView.ViewHolder(binding.root)
}
