# 🚀 **QUICK START: View IIT Mandi Address Selector**

## 🎯 **You can now see the address selector in your frontend!**

### **📍 Method 1: Address Demo Page (Recommended)**
1. **Start your frontend** (if not running):
   ```bash
   cd /home/karandeep/robo_Q/frontend
   npm run dev
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:3000/address-demo
   ```

3. **What you'll see**:
   - ✅ Complete showcase of all 17 IIT Mandi locations
   - ✅ Interactive address selector with categories
   - ✅ Statistics: 5 Hostels, 6 Academic areas, 1 Guest house, 5 Mess locations
   - ✅ Real-time address preview
   - ✅ All locations with GPS coordinates

### **👤 Method 2: Profile Page Integration**
1. **Go to**: `http://localhost:3000/profile`
2. **Click**: "Edit Profile" button
3. **Look for**: Address section with radio buttons
4. **Select**: "IIT Mandi Campus" option
5. **Choose**: Your campus location from dropdown

### **🧭 Method 3: Navigation Menu**
- **Look for**: "📍 Address Demo" link in the top navigation bar
- **Available on**: Both desktop and mobile versions

## 🏛️ **Available Locations (17 Total)**

### **🏠 Hostels (5)**
- B10, B12, B15, B8, B9

### **🎓 Academic Areas (6)**
- A13, A11, A17, Auditorium, A14, Library

### **🏨 Guest House (1)**
- CV Raman Guest House

### **🍽️ Mess (5)**
- Pine, Alder, Tulsi, Peepal, Oak

## 🎯 **Features You'll Experience**

### **📱 User Interface**
- ✅ **Two-level dropdown**: Category → Specific location
- ✅ **Visual feedback**: Selected addresses highlighted
- ✅ **Mobile responsive**: Works on all screen sizes
- ✅ **Accessibility**: Keyboard navigation support

### **🔧 Technical Features**
- ✅ **Real-time preview**: See selected address immediately
- ✅ **GPS coordinates**: Precise location data included
- ✅ **Category organization**: Logical grouping of locations
- ✅ **Search functionality**: Type to filter (in full implementation)

## 🚀 **Integration Points**

### **✅ Currently Integrated**
- **Profile Page**: Update your default address
- **Address Demo**: Full showcase and testing
- **Navigation**: Easy access from menu

### **🔄 Ready for Integration**
- **Checkout Page**: Select delivery address
- **Order Placement**: Choose delivery location
- **Vendor Setup**: Set business location
- **Registration**: Set initial address

## 🎉 **Next Steps**

1. **Visit the demo page** to see all features
2. **Test the profile integration** to update your address
3. **Explore different categories** and locations
4. **Check mobile responsiveness** on your phone

## 📋 **Troubleshooting**

### **If you don't see the address selector:**
1. **Check frontend is running**: `npm run dev` in `/frontend` directory
2. **Clear browser cache**: Ctrl+F5 or Cmd+Shift+R
3. **Check console**: F12 → Console for any errors
4. **Verify URL**: Make sure you're on `http://localhost:3000/address-demo`

### **If dropdown doesn't work:**
1. **Check imports**: AddressSelector component should be imported
2. **Verify constants**: IIT_MANDI_ADDRESSES should be available
3. **Check network**: Backend should be running on port 5000

---

**🎯 The IIT Mandi address selector is now live and ready to use!**

**Start with the demo page to see all features in action!** 🚀
