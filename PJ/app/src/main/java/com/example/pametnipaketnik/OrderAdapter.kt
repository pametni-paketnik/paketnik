package com.example.pametnipaketnik

import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import com.bumptech.glide.Glide
import androidx.recyclerview.widget.RecyclerView
import com.example.pametnipaketnik.databinding.ItemTimelineHeaderBinding
import com.example.pametnipaketnik.databinding.OrderItemsBinding

class OrderAdapter(
    private val orderList: List<TimelineItem>,
    private val baseUrl: String
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
                val itemContext = orderHolder.itemView.context
                orderHolder.binding.textOrderId.text =
                    itemContext.getString(R.string.narocilo, item.boxId)
                orderHolder.binding.textLocation.text =
                    itemContext.getString(R.string.lokacija, item.address)
                orderHolder.binding.textStatus.text =
                    itemContext.getString(R.string.status, item.status)

                val firstProduct = item.products.firstOrNull()
                if (firstProduct != null && firstProduct.path.isNotEmpty()) {

                    val cleanBaseUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
                    val cleanPath = if (firstProduct.path.startsWith("/")) firstProduct.path.substring(1) else firstProduct.path

                    val fullImageUrl = cleanBaseUrl + cleanPath
                    Log.d("MainActivity_Debug", "Sestavljen končni URL za Glide: $fullImageUrl")

                    Glide.with(orderHolder.itemView.context)
                        .load(fullImageUrl)
                        .placeholder(android.R.drawable.ic_menu_gallery)
                        .error(android.R.drawable.stat_notify_error)
                        .into(orderHolder.binding.imageProduct)
                } else {
                    orderHolder.binding.imageProduct.setImageResource(android.R.drawable.ic_menu_gallery)
                }
            }
        }
    }

    override fun getItemCount(): Int {
    return orderList.size
    }
    class HeaderViewHolder(val binding: ItemTimelineHeaderBinding) : RecyclerView.ViewHolder(binding.root)
    class OrderViewHolder(val binding: OrderItemsBinding) : RecyclerView.ViewHolder(binding.root)
}