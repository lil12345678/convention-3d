# 
会展大屏前端。开发时在本目录执行 npm run dev，打开 http://localhost:3000，/api 由 Vite 转到 127.0.0.1:8000。

按上线方式看页面时，在本目录执行 npm run build，生成 dist。然后到上一级 convention 执行 docker compose up -d --build，打开 http://localhost:8080。nginx.conf 负责把 dist 里的文件发出去，并把 /api 转到名为 api 的后端容器。改完页面要重新 npm run build，再刷新浏览器。

# 如果修改了nginx.conf，不会自动生效的，需要手动reload
# docker exec web nginx -s reload