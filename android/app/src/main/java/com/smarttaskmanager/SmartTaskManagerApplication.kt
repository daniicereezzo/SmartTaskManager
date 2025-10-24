package com.smarttaskmanager

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class SmartTaskManagerApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize ThreeTenABP for date/time handling
        org.threeten.bp.LocalDateTime.now()
    }
}
