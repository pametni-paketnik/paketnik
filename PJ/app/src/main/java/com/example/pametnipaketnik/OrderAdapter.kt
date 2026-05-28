package com.example.pametnipaketnik

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.pametnipaketnik.databinding.OrderItemsBinding
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit
data class HeaderItem(val title: String): TimelineItem
class OrderAdapter(
    private var orderList: List<TimelineItem>,
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

            holder.binding.orderDate.text = currentOrder.date
            holder.binding.orderTitle.text = "Paketnik: ${currentOrder.boxId}"

            holder.binding.orderCardView.alpha = 1.0f
            holder.binding.itemOpenBox.alpha = 1.0f
            holder.binding.orderCardView.setOnClickListener(null)

            val statusLower = currentOrder.status.lowercase(Locale.getDefault())

            if (statusLower == "prevzeto") {
                holder.binding.orderAddress.text = "Status: PREVZETO"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#4CAF50"))

                holder.binding.orderCardView.alpha = 0.5f
                holder.binding.itemOpenBox.alpha = 0.25f
                holder.binding.orderCardView.setOnClickListener(null)

            } else if (daysAgo > 3 && statusLower != "prevzeto") {
                holder.binding.orderAddress.text = "Status: ZAPADEL ROK PREVZEMA"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#F44336"))

                holder.binding.orderCardView.alpha = 0.75f
                holder.binding.itemOpenBox.alpha = 0.4f
                holder.binding.orderCardView.setOnClickListener(null)

            } else {
                holder.binding.orderAddress.text = "Status: ODDANO V PAKETNIK"
                holder.binding.orderAddress.setTextColor(android.graphics.Color.parseColor("#4CAF50"))

                holder.binding.orderCardView.setOnClickListener {
                    onOrderClick(currentOrder)
                }
            }
        }
    }

    override fun getItemCount(): Int = orderList.size

    fun updateDate(newList: List<TimelineItem>) {
        this.orderList = newList
        notifyDataSetChanged()
    }
    private fun getDaysAgoCount(dateString: String): Long {
        if(dateString.isEmpty()) return 0L
        return try{
            val format = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            val dateFromDb = format.parse(dateString) ?: return 0L

            val calendar = Calendar.getInstance()

            val today = calendar.apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }.time

            val dbDateClean = Calendar.getInstance().apply {
                time = dateFromDb
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }.time

            val diffInMillies = today.time - dbDateClean.time
            TimeUnit.MILLISECONDS.toDays(diffInMillies)
        } catch (e: Exception){
            0L
        }
    }
}