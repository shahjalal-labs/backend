# 🌟 backend

## 📂 Project Information

| 📝 **Detail**           | 📌 **Value**                                                              |
|------------------------|---------------------------------------------------------------------------|
| 🔗 **GitHub URL**       | [https://github.com/shahjalal-labs/backend](https://github.com/shahjalal-labs/backend)                                                                  |
| 🌐 **Live Site**        | [http://shahjalal-mern.surge.sh](http://shahjalal-mern.surge.sh)                                                                  |
| 💻 **Portfolio GitHub** | [https://github.com/shahjalal-labs/shahjalal-portfolio-v2](https://github.com/shahjalal-labs/shahjalal-portfolio-v2)                                                                  |
| 🌐 **Portfolio Live**   | [http://shahjalal-labs.surge.sh](http://shahjalal-labs.surge.sh)                                                                  |
| 📁 **Directory**        | `/home/sj/web/learning/sangam/chatapp_pr/backend`                                                                      |
| 📅 **Created On**       | `04/02/2026 09:56 PM Wed GMT+6`                                                                      |
| 📍 **Location**         | Sharifpur, Gazipur, Dhaka                                                                        |
| 💼 **LinkedIn**         | [https://www.linkedin.com/in/shahjalal-labs/](https://www.linkedin.com/in/shahjalal-labs/)                                                                  |
| 📘 **Facebook**         | [https://www.facebook.com/shahjalal.labs](https://www.facebook.com/shahjalal.labs)                                                                  |
| ▶️ **Twitter**          | [https://x.com/shahjalal_labs](https://x.com/shahjalal_labs)                                                                  |
| 🔒 **Visibility**       | **Public** 🌍                                                                        |

---
### `Developer info:`
![Developer Info:](https://i.ibb.co/kVR4YmrX/developer-Info-Github-Banner.png)

> 🚀 
> 🧠 

    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d bridgesystemllc.com -d bridgesystemllc.com

server{
server_name api.bridgesystemllc.com;
root /var/www/ashmaster-backend;

        location / {
            proxy_pass http://localhost:6011;
            proxy_http_version 1.1;

            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        client_max_body_size 3000M;
    }

    "start": "concurrently \"node ./dist/server.js\" \"node ./dist/workers/emailWorker.js\" \"node ./dist/workers/notificationWorker.js\"",