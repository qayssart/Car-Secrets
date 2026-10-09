# دليل بناء تطبيق أندرويد (APK)

## المتطلبات

1. **Node.js** — مثبت مسبقًا (يأتي مع المشروع)
2. **Android Studio** — حمّله من https://developer.android.com/studio
3. **Java JDK 17+** — يأتي عادةً مع Android Studio

## خطوات البناء

### 1. تثبيت حزم المشروع
```bash
npm install
```

### 2. بناء ملفات الويب ومزامنتها مع أندرويد
```bash
npm run cap:build
```
هذا الأمر يبني ملفات الويب ويضعها داخل مشروع أندرويد.

### 3. فتح المشروع في Android Studio
```bash
npm run cap:open
```
أو افتح Android Studio يدويًا واختر مجلد `android/`.

### 4. توليد ملف APK

#### الطريقة الأولى (من Android Studio):
1. من القائمة: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. انتظر حتى ينتهي البناء
3. اضغط على **locate** للوصول إلى ملف APK

#### الطريقة الثانية (سطر الأوامر):
```bash
cd android
./gradlew assembleDebug
```
ملف APK سيكون في:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. نسخة للنشر (Release APK)
لإنتاج نسخة موقعة للنشر على متجر Play:

1. أنشئ مفتاح توقيع (keystore):
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. من Android Studio: **Build → Generate Signed Bundle / APK → APK**
3. اختر ملف الـ keystore وأدخل كلمة المرور
4. اختر **release** ثم اضغط **Create**

أو من سطر الأوامر:
```bash
cd android
./gradlew assembleRelease
```

ملف APK سيكون في:
```
android/app/build/outputs/apk/release/app-release.apk
```

## تثبيت APK على هاتفك

1. انقل ملف APK إلى هاتفك
2. فعّل **"تثبيت تطبيقات من مصادر غير معروفة"** من إعدادات الأندرويد
3. افتح ملف APK واضغط **تثبيت**

## ملاحظات

- في كل مرة تعدل فيها الكود، أعد تشغيل `npm run cap:build` ثم أعد البناء من Android Studio
- اسم التطبيق: **أوتوفيكس AI**
- معرّف الحزمة: `com.autofix.ai`
- الحد الأدنى لإصدار أندرويد: 7.0 (API 24)
