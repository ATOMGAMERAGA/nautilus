# Capacitor
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# WebRTC
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# Keep JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep source file/line info for stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
