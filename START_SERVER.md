# 🚀 How to Start RoboQ Server

## **Simple Start Commands**

### **Start Backend Server**
```bash
cd /home/karandeep/robo_Q/backend
npm start
```

### **Start Frontend Server** (in new terminal)
```bash
cd /home/karandeep/robo_Q/frontend
npm run dev
```

## **Development Mode** (with auto-restart)
```bash
# Backend with nodemon
cd /home/karandeep/robo_Q/backend
npm run dev

# Frontend with hot reload
cd /home/karandeep/robo_Q/frontend
npm run dev
```

## **Quick Test**
```bash
# Test backend
curl http://localhost:5000/api/health

# Open frontend
# Go to: http://localhost:3000
```

## **Test Accounts**
- **Customer**: john@example.com / password123
- **Vendor**: pizza@example.com / password123

## **URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

**That's it! Only one server to run now - the new database server!** 🎉
