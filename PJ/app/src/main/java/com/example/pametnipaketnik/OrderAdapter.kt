package com.example.pametnipaketnik

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.recyclerview.widget.RecyclerView
import com.example.pametnipaketnik.databinding.OrderItemsBinding
data class HeaderItem(val title: String): TimelineItem
class OrderAdapter(
    private val orderList: List<TimelineItem>,
    private val onOrderClick: (Order) -> Unit
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val TYPE_HEADER = 0
    private val TYPE_ORDER = 1

    class HeaderViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textTitle: TextView = view.findViewById(R.id.textHeaderTitle)
    }
    class OrderViewHolder(val binding: OrderItemsBinding) : RecyclerView.ViewHolder(binding.root)

    override fun getItemViewType(position: Int): Int {
        return if (orderList[position] is HeaderItem) TYPE_HEADER else TYPE_ORDER
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == TYPE_HEADER) {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_timeline_header, parent, false)
            HeaderViewHolder(view)
        } else {
            val binding = OrderItemsBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            OrderViewHolder(binding)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        if (holder is HeaderViewHolder) {
            val headerItem = orderList[position] as HeaderItem
            holder.textTitle.text = headerItem.title
        }
        else if (holder is OrderViewHolder){
            val currentOrder = orderList[position] as Order

            val daysAgo = getDaysAgoCount(currentOrder.date)
            val timeAgoText = getDaysAgoText(daysAgo, currentOrder.date)
            holder.binding.orderDate.text = "$timeAgoText"
            holder.binding.orderTitle.text = "Paketnik: ${currentOrder.boxId}"

            holder.binding.orderCardView.alpha = 1.0f
            holder.binding.itemOpenBox.alpha = 1.0f

            if (currentOrder.status.equals("oddano", ignoreCase = true)) {
                holder.binding.orderAddress.text = "Status: ${currentOrder.status}"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#4CAF50"))

                holder.binding.orderCardView.alpha = 0.5f
                holder.binding.itemOpenBox.alpha = 0.25f
                holder.binding.orderCardView.setOnClickListener(null)
            } else if (daysAgo > 3 && !currentOrder.status.equals("Prevzeto", ignoreCase = true)) {
                holder.binding.orderAddress.text = "Status: Potekel rok za prevzem"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#F44336"))

                holder.binding.orderCardView.alpha = 0.75f
                holder.binding.itemOpenBox.alpha = 0.4f
                holder.binding.orderCardView.setOnClickListener(null)
            } else {
                holder.binding.orderAddress.text = "Status: ${currentOrder.status}"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#4CAF50"))

                holder.binding.orderCardView.setOnClickListener {
                    onOrderClick(currentOrder)
                }
            }
        }
    }

    override fun getItemCount(): Int = orderList.size
    private fun getDaysAgoCount(dateString: String): Long {
        if(dateString.isEmpty()) return 0L
        return try{
            val format = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            val dateFromDb = format.parse(dateString) ?: return 0L
            val today = java.util.Date()
            val diffInMillies = today.time - dateFromDb.time
            java.util.concurrent.TimeUnit.MILLISECONDS.toDays(diffInMillies)
        } catch (e: Exception){
            0L
        }
    }
    private fun getDaysAgoText(diffInDays: Long, originalDate: String): String {
        return when {
            diffInDays == 0L -> "Danes ($originalDate)"
            diffInDays == 1L -> "Včeraj ($originalDate)"
            diffInDays in 2L..3L -> "Pred $diffInDays dnevi ($originalDate)"
            diffInDays > 3L -> "Poteklo pred ${diffInDays - 3} dnevi ($originalDate)"
            else -> originalDate
        }
    }
}