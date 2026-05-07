package com.example.pametnipaketnik

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.pametnipaketnik.databinding.ItemHistoryBinding

class HistoryAdapter(
    private var items: List<HistoryItem>
): RecyclerView.Adapter<HistoryAdapter.HistoryViewHolder>() {
    class HistoryViewHolder(
        val binding: ItemHistoryBinding
    ): RecyclerView.ViewHolder(binding.root)

    fun updateItems(newItems: List<HistoryItem>) {
        items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val binding = ItemHistoryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return HistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        val item = items[position]

        holder.binding.textBoxNumber.text = "#${item.boxId}"
        holder.binding.textBoxId.text = "Paketnik: ${item.boxId}"
        holder.binding.textDate.text = item.date
        if(item.status == "Odprto") {
            holder.binding.textStatus.text = "POSKUS USPESEN"
            holder.binding.textStatus.setTextColor(
                holder.itemView.context.getColor(R.color.history_accept)
            )
        } else {
            holder.binding.textStatus.text = "NAPAKA PRI ODPIRANJU"
            holder.binding.textStatus.setTextColor(
                holder.itemView.context.getColor(R.color.history_error)
            )
        }
    }

    override fun getItemCount(): Int {
        return items.size
    }
}