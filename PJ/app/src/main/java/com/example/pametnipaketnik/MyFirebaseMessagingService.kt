package com.example.pametnipaketnik

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        val title = message.notification?.title ?: "Novo obvestilo"
        val content = message.notification?.body ?: "Dostavljalec je posodobil stanje vašega paketnika"

        showLOcalNotification(title, content)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM_Token", "Ustvarjen je nov žeton naprave: $token")

        val sharedPreferences = getSharedPreferences("USerPrefs", Context.MODE_PRIVATE)
        val savedUserId = sharedPreferences.getString("LOGGED_IN_USER_ID", "") ?: ""

        if(savedUserId.isNotEmpty()){
            val scope = kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO)
            scope.launch {
                try {
                    val requestModel = FCMTokenRequest(userId = savedUserId, fcmToken = token)
                    ApiClient.apiService.updateFcmToken(requestModel)
                    Log.d("FCM_Token", "Nov žeton uspešno osvežen na API strežniku.")
                } catch (e: Exception) {
                    Log.e("FCM_Token", "Napaka pri pošiljanju osveženega žetona", e)
                }
            }
        }
    }

    private fun showLOcalNotification(title: String, content: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
         addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "paketnik_notification_channel"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(content)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            val channel = NotificationChannel(
                channelId,
                "Obvestila o paketnikih",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }
        notificationManager.notify(0, notificationBuilder.build())
    }
}