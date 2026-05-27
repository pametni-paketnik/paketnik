package com.example.pametnipaketnik

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.pametnipaketnik.databinding.OrderItemsBinding

class OrderAdapter(private val orderList: List<Order>) : RecyclerView.Adapter<OrderAdapter.OrderViewHolder>() {

    class OrderViewHolder(val binding: OrderItemsBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
        val binding = OrderItemsBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return OrderViewHolder(binding)
    }

    override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
        val currentOrder = orderList[position]

        holder.binding.orderTitle.text = "Paketnik: ${currentOrder.boxId}"
        holder.binding.orderAddress.text = "Status: ${currentOrder.status}"
        holder.binding.orderDate.text = currentOrder.date
    }
    override fun getItemCount(): Int = orderList.size
}