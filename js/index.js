     // ================= 核心数据与初始化 =================
      const fixedProducts =[
        { id: 'fixed_1', name: "保定曲阳汉白玉石雕・反弹琵琶飞天摆件", price: "1280", img: "img/a.jpg", desc: "国家级非物质文化遗产「曲阳石雕」代表性作品，选用天然汉白玉整料手工雕刻而成。作品以敦煌飞天为灵感，人物衣袂飘逸、线条灵动，琵琶细节、云纹底座栩栩如生，将传统雕刻技艺与东方美学完美融合，兼具收藏价值与艺术观赏性，是彰显河北非遗文化的高端礼赠佳品。", isFixed: true },
        { id: 'fixed_2', name: "保定易县易水砚・长城纹圆形砚台", price: "599", img: "img/b.jpg", desc: "国家级非物质文化遗产「易水砚制作技艺」出品，采用易县特产紫翠石手工雕刻而成。砚台以长城为设计元素，纹理古朴大气，石质细腻坚密、发墨如油、不损笔毫，是文房四宝中的经典名砚。既适合书法爱好者日常使用，也可作为非遗文化礼品，承载保定易县千年制砚文化。", isFixed: true },
        { id: 'fixed_3', name: "保定定州定窑白釉刻花缠枝纹斗笠碗", price: "899", img: "img/c.jpg", desc: "国家级非物质文化遗产「定窑烧制技艺」复刻作品，还原宋代五大名窑定窑的经典工艺。碗身采用白釉刻花工艺，缠枝花卉纹样灵动流畅，釉色温润如玉，口沿包金提升质感，兼具日用与收藏价值。作为保定曲阳的非遗名片，是展现河北宋瓷文化的高端文创礼器。", isFixed: true },
        { id: 'fixed_4', name: "雄安白洋淀芦苇画・荷塘鸳鸯装饰画", price: "389", img: "img/d.jpg", desc: "河北省级非物质文化遗产「白洋淀芦苇画」代表性作品，采用白洋淀天然芦苇，经选料、烫色、裁切、粘贴等多道手工工序制作而成。作品以雄安白洋淀荷塘、鸳鸯为主题，画面质感温润、层次分明，完美还原水乡生态风貌，是极具雄安地域特色的非遗文创，适合家居装饰与礼赠。", isFixed: true }
      ];

      const defaultData = {
        users:[{ id: "admin_1", role: "admin", account: "root", password: "123456", nickname: "超级管理员", address: "", avatar: "" }],
        orders:[],
      };

      function getData(key) {
        if (key === 'products') {
            const dynamicProducts = JSON.parse(localStorage.getItem('dynamicProducts')) || [];
            return[...fixedProducts, ...dynamicProducts];
        }
        return JSON.parse(localStorage.getItem(key)) || defaultData[key];
      }

      function setData(key, val) {
        if (key === 'products') {
            const dynamicProducts = val.filter(p => !p.isFixed);
            localStorage.setItem('dynamicProducts', JSON.stringify(dynamicProducts));
        } else {
            localStorage.setItem(key, JSON.stringify(val));
        }
      }

      if (!localStorage.getItem("users")) setData("users", defaultData.users);
      if (!localStorage.getItem("orders")) setData("orders", defaultData.orders);
      
      // 【新增】：初始化收藏夹和购物车数据
      if (!localStorage.getItem("favorites")) setData("favorites",[]);
      if (!localStorage.getItem("cart")) setData("cart",[]);

      let storedProducts = JSON.parse(localStorage.getItem("products"));
      if (!storedProducts || storedProducts.length < 4) { setData("products", defaultData.products); }

      let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
      let currentViewingProduct = null;

      function fileToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 800; 
                let width = img.width;
                let height = img.height;
                if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
                else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => callback(e.target.result);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      function initApp() {
        renderHomeProducts();
        updateMemberUI();
      }

      function renderHomeProducts() {
        const products = getData("products");
        const container = document.getElementById("home-product-list");
        container.innerHTML = products.map((p) => `
            <div class="product-card" onclick="openProductDetail('${p.id}')">
                <img class="product-img" src="${p.img}" alt="商品" onerror="this.src='https://via.placeholder.com/400x400/eee?text=商品图'">
                <div class="product-info">
                    <div class="product-title">${p.name}</div>
                    <div class="product-bottom"><div class="product-price">${p.price}</div><button class="buy-btn">购买</button></div>
                </div>
            </div>
        `).join("");
      }

      function updateMemberUI() {
        if (currentUser && currentUser.role === "user") {
          document.getElementById("member-username").innerText = currentUser.nickname || currentUser.account;
          document.getElementById("member-avatar").src = currentUser.avatar || "https://images.unsplash.com/photo-1594824436845-a75168019bfa?w=200&q=80";
          document.getElementById("btn-logout").style.display = "inline-block";
          document.getElementById("btn-edit-profile").style.display = "inline-block";
          document.getElementById("btn-admin-login").style.display = "inline-block";

          const orders = getData("orders").filter((o) => o.userAccount === currentUser.account);
          const counts = { shipment: 0, receipt: 0, review: 0 };
          orders.forEach((o) => {
            if (o.status === "pending_shipment") counts.shipment++;
            if (o.status === "pending_receipt") counts.receipt++;
            if (o.status === "pending_review") counts.review++;
          });
          ["shipment", "receipt", "review"].forEach((type) => {
            const el = document.getElementById(`badge-${type}`);
            el.innerText = counts[type];
            el.style.display = counts[type] > 0 ? "inline-block" : "none";
          });
        } else {
          document.getElementById("member-username").innerText = "点击登录";
          document.getElementById("member-avatar").src = "https://images.unsplash.com/photo-1594824436845-a75168019bfa?w=200&q=80";
          document.getElementById("btn-logout").style.display = "none";
          document.getElementById("btn-edit-profile").style.display = "none";
          document.getElementById("btn-admin-login").style.display = "none";["shipment", "receipt", "review"].forEach((type) => { document.getElementById(`badge-${type}`).style.display = "none"; });
        }
      }

      function switchTab(tabId, element, requireAuth = false) {
        document.querySelectorAll(".page-container").forEach((p) => p.classList.remove("active"));
        document.querySelectorAll(".tab-item").forEach((t) => t.classList.remove("active"));
        document.getElementById("page-" + tabId).classList.add("active");
        element.classList.add("active");
        if (requireAuth && (!currentUser || currentUser.role === "admin")) requireLogin();
      }

      function closeFullPage(id) { document.getElementById(id).style.display = "none"; }
      function closeModal(id) {
        document.getElementById(id).style.display = "none";
        const inputs = document.querySelectorAll(`#${id} input`);
        inputs.forEach((input) => { if (input.type === "file") input.value = ""; else input.value = ""; });
      }

      function requireLogin() {
        if (!currentUser || currentUser.role === "admin") document.getElementById("login-modal").style.display = "flex";
      }

      function openProductDetail(id) {
        const p = getData("products").find((x) => x.id == id);
        if (!p) return;
        currentViewingProduct = p;
        document.getElementById("detail-img").src = p.img;
        document.getElementById("detail-price").innerText = `¥ ${p.price}`;
        document.getElementById("detail-title").innerText = p.name;
        document.getElementById("detail-desc").innerText = p.desc || "非遗精品，匠心制作。";
        
        // 检查是否已收藏
        let favs = getData("favorites");
        let isFav = currentUser ? favs.some(f => f.userAccount === currentUser.account && f.productId == id) : false;
        document.getElementById('btn-favorite').innerHTML = isFav ? "❤️ 已收藏" : "🤍 收藏";
        
        document.getElementById("page-detail").style.display = "block";
      }

      // 【新增点】：收藏与购物车逻辑
      function toggleFavorite() {
        if (!currentUser || currentUser.role === "admin") { requireLogin(); return; }
        let favs = getData("favorites");
        let index = favs.findIndex(f => f.userAccount === currentUser.account && f.productId == currentViewingProduct.id);
        if (index > -1) {
            favs.splice(index, 1);
            document.getElementById('btn-favorite').innerHTML = "🤍 收藏";
            alert("已取消收藏");
        } else {
            favs.push({ userAccount: currentUser.account, productId: currentViewingProduct.id });
            document.getElementById('btn-favorite').innerHTML = "❤️ 已收藏";
            alert("收藏成功！可以在【我的】-【我的收藏】中查看");
        }
        setData("favorites", favs);
      }

      function addToCart() {
        if (!currentUser || currentUser.role === "admin") { requireLogin(); return; }
        let cart = getData("cart");
        let exists = cart.find(c => c.userAccount === currentUser.account && c.productId == currentViewingProduct.id);
        if(exists) {
            alert("该商品已在购物车中！");
        } else {
            cart.push({ userAccount: currentUser.account, productId: currentViewingProduct.id });
            setData("cart", cart);
            alert("已成功加入购物车！");
        }
      }

      function renderProductList(dataArray, containerId, emptyMsg) {
        const container = document.getElementById(containerId);
        if(dataArray.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; color:#999;">${emptyMsg}</div>`;
            return;
        }
        const products = getData("products");
        container.innerHTML = dataArray.map(item => {
            const p = products.find(x => x.id == item.productId);
            if(!p) return '';
            return `
            <div class="order-list-item" onclick="openProductDetail('${p.id}')">
                <div style="display:flex;">
                    <img src="${p.img}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; margin-right:15px;" onerror="this.src='https://via.placeholder.com/60/eee'">
                    <div>
                        <div style="font-size:14px; margin-bottom:5px; font-weight:bold; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.name}</div>
                        <div style="color:var(--primary-color);">¥${p.price}</div>
                    </div>
                </div>
            </div>`;
        }).join("");
      }

      function showFavorites() {
        if (!currentUser || currentUser.role === "admin") { requireLogin(); return; }
        let favs = getData("favorites").filter(f => f.userAccount === currentUser.account);
        renderProductList(favs, "my-favorites-list", "暂无收藏的商品");
        document.getElementById('page-favorites').style.display = 'block';
      }

      function showCart() {
        if (!currentUser || currentUser.role === "admin") { requireLogin(); return; }
        let cart = getData("cart").filter(c => c.userAccount === currentUser.account);
        renderProductList(cart, "my-cart-list", "购物车空空如也，快去挑选商品吧");
        document.getElementById('page-cart').style.display = 'block';
      }

      function showEmptyPage(title, msg) {
        if (!currentUser || currentUser.role === "admin") { requireLogin(); return; }
        document.getElementById('empty-page-title').innerText = title;
        document.getElementById('empty-page-msg').innerText = msg;
        document.getElementById('page-empty').style.display = 'block';
      }

      // 【新增点】：收货地址管理逻辑
      function showAddressPage() {
        if (!currentUser || currentUser.role === "admin") { requireLogin(); return; }
        
        // 尝试从单字符串解析出姓名、电话、地址
        let parts = (currentUser.address || '').split(' ');
        if (parts.length >= 3) {
            document.getElementById('addr-name').value = parts[0];
            document.getElementById('addr-phone').value = parts[1];
            document.getElementById('addr-detail').value = parts.slice(2).join(' ');
        } else {
            document.getElementById('addr-name').value = '';
            document.getElementById('addr-phone').value = '';
            document.getElementById('addr-detail').value = currentUser.address || '';
        }
        
        document.getElementById('page-address').style.display = 'block';
      }

      function saveAddress() {
        let name = document.getElementById('addr-name').value.trim();
        let phone = document.getElementById('addr-phone').value.trim();
        let detail = document.getElementById('addr-detail').value.trim();

        if(!name || !phone || !detail) { alert("请填写完整信息！"); return; }
        
        // 格式化为单一字符串以便兼容后台直接展示
        let formattedAddress = `${name} ${phone} ${detail}`;

        let users = getData("users");
        let idx = users.findIndex(u => u.account === currentUser.account);
        if(idx !== -1) {
            users[idx].address = formattedAddress;
            setData("users", users);
            currentUser.address = formattedAddress;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            alert("收货地址保存成功！");
            closeFullPage('page-address');
        }
      }

      function goToCheckout() {
        if (!currentUser || currentUser.role === "admin") {
          alert("请先登录普通用户账户！");
          document.getElementById("login-modal").style.display = "flex";
          return;
        }

        const p = currentViewingProduct;
        document.getElementById("checkout-img").src = p.img;
        document.getElementById("checkout-title").innerText = p.name;
        document.getElementById("checkout-price").innerText = `¥ ${p.price}`;
        document.getElementById("checkout-total").innerText = `¥ ${p.price}`;
        
        // 结算页显示最新设置的地址
        document.getElementById("checkout-address").value = currentUser.address || "";
        
        document.getElementById("page-checkout").style.display = "block";
      }

      function submitOrder() {
        const address = document.getElementById("checkout-address").value.trim();
        const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
        if (!address) { alert("请填写收货地址！"); return; }

        let users = getData("users");
        let userIdx = users.findIndex((u) => u.account === currentUser.account);
        users[userIdx].address = address;
        setData("users", users);
        currentUser.address = address;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        let orders = getData("orders");
        orders.push({
          id: "ORD" + new Date().getTime(),
          userAccount: currentUser.account,
          productName: currentViewingProduct.name,
          productImg: currentViewingProduct.img,
          price: currentViewingProduct.price,
          address: address,
          payMethod: payMethod === "WeChat" ? "微信支付" : "支付宝",
          status: "pending_shipment",
          date: new Date().toLocaleString(),
        });
        setData("orders", orders);

        alert("支付成功！商品将在后台排期发货。");
        closeFullPage("page-checkout");
        closeFullPage("page-detail");
        updateMemberUI();
        document.querySelectorAll(".tab-item")[3].click();
      }

      const statusMap = { pending_shipment: "待发货", pending_receipt: "待收货", pending_review: "待评价" };
      function showUserOrders(statusFilter) {
        if (!currentUser) return;
        document.getElementById("my-orders-title").innerText = statusMap[statusFilter] + "订单";
        const orders = getData("orders").filter((o) => o.userAccount === currentUser.account && o.status === statusFilter);
        const container = document.getElementById("my-orders-list");

        if (orders.length === 0) {
          container.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">暂无相关订单</div>';
        } else {
          container.innerHTML = orders.map((o) => `
                <div class="order-list-item">
                    <div style="font-size:12px; color:#999; margin-bottom:10px;">订单号: ${o.id} <span class="order-status">${statusMap[o.status]}</span></div>
                    <div style="display:flex;">
                        <img src="${o.productImg}" style="width:50px; height:50px; border-radius:4px; margin-right:10px;" onerror="this.src='https://via.placeholder.com/50/eee'">
                        <div>
                            <div style="font-size:14px; margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${o.productName}</div>
                            <div style="color:var(--primary-color);">¥${o.price}</div>
                        </div>
                    </div>
                </div>
            `).join("");
        }
        document.getElementById("page-my-orders").style.display = "block";
      }

      // ================= 前台逻辑：登录与注册 =================
      function toggleAuth(mode) {
        document.getElementById("tab-login").classList.toggle("active", mode === "login");
        document.getElementById("tab-register").classList.toggle("active", mode === "register");
        document.getElementById("form-login").style.display = mode === "login" ? "block" : "none";
        document.getElementById("form-register").style.display = mode === "register" ? "block" : "none";
      }

      function doRegister() {
        const acc = document.getElementById("reg-account").value.trim();
        const pwd = document.getElementById("reg-password").value.trim();
        if (!acc || !pwd) { alert("账号和密码不能为空！"); return; }

        let users = getData("users");
        if (users.some((u) => u.account === acc)) { alert("账号已存在，请直接登录！"); return; }

        users.push({ id: "u_" + Date.now(), role: "user", account: acc, password: pwd, nickname: "", avatar: "", address: "" });
        setData("users", users);
        alert("注册成功！请登录。");
        toggleAuth("login");
        document.getElementById("reg-account").value = "";
        document.getElementById("reg-password").value = "";
      }

      function doLogin() {
        const role = document.getElementById("login-role").value;
        const acc = document.getElementById("login-account").value.trim();
        const pwd = document.getElementById("login-password").value.trim();

        const users = getData("users");
        const user = users.find((u) => u.account === acc && u.password === pwd && u.role === role);

        if (user) {
          currentUser = user;
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
          closeModal("login-modal");
          if (role === "admin") initAdmin(); else updateMemberUI();
        } else {
          alert("账号或密码错误，或身份不匹配！");
        }
      }

      function logout() {
        currentUser = null;
        localStorage.removeItem("currentUser");
        updateMemberUI();
      }

      function openEditProfileModal() {
        if (!currentUser) return;
        document.getElementById("edit-profile-nickname").value = currentUser.nickname || "";
        document.getElementById("edit-profile-modal").style.display = "flex";
      }

      function saveUserProfile() {
        const newNickname = document.getElementById("edit-profile-nickname").value.trim();
        const fileInput = document.getElementById("edit-profile-avatar-file");

        const finishSave = (base64Img) => {
          let users = getData("users");
          let userIdx = users.findIndex((u) => u.account === currentUser.account);
          if (userIdx !== -1) {
            users[userIdx].nickname = newNickname;
            if (base64Img) users[userIdx].avatar = base64Img;
            setData("users", users);
            currentUser.nickname = newNickname;
            if (base64Img) currentUser.avatar = base64Img;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            updateMemberUI();
            alert("资料修改成功！");
            closeModal("edit-profile-modal");
          }
        };

        if (fileInput.files && fileInput.files[0]) fileToBase64(fileInput.files[0], finishSave);
        else finishSave(null);
      }

      function openAdminVerifyModal() {
        document.getElementById("admin-verify-modal").style.display = "flex";
      }

      function verifyAdminAndEnter() {
        const acc = document.getElementById("admin-verify-account").value.trim();
        const pwd = document.getElementById("admin-verify-password").value.trim();
        const users = getData("users");
        const adminUser = users.find((u) => u.account === acc && u.password === pwd && u.role === "admin");

        if (adminUser) {
          closeModal("admin-verify-modal");
          initAdmin();
        } else {
          alert("管理员账号或密码错误！");
        }
      }

      // ================= 管理员后台逻辑 =================
      function initAdmin() {
        document.getElementById("app").style.display = "none";
        document.getElementById("admin-dashboard").style.display = "flex";
        renderAdminProducts();
        renderAdminOrders();
        renderAdminUsers();
      }

      function logoutAdmin() {
        document.getElementById("admin-dashboard").style.display = "none";
        document.getElementById("app").style.display = "block";
        updateMemberUI();
      }

      function switchAdminTab(tab, element) {
        document.querySelectorAll(".admin-menu-item").forEach((el) => el.classList.remove("active"));
        document.querySelectorAll(".admin-panel").forEach((el) => el.classList.remove("active"));
        element.classList.add("active");
        document.getElementById("admin-" + tab).classList.add("active");
        if (tab === "products") renderAdminProducts();
        if (tab === "orders") renderAdminOrders();
        if (tab === "users") renderAdminUsers();
      }

      let editingProductId = null;
      let tempProductImageBase64 = "";

      function previewProductImage(input) {
        if (input.files && input.files[0]) {
          fileToBase64(input.files[0], (base64) => {
            tempProductImageBase64 = base64;
            document.getElementById("add-prod-img-preview").src = base64;
            document.getElementById("add-prod-img-preview").style.display = "block";
          });
        }
      }

      function renderAdminProducts() {
        const products = getData("products");
        const tbody = document.querySelector("#admin-product-table tbody");
        tbody.innerHTML = products.map((p) => `
            <tr>
                <td>${p.isFixed ? '<span style="color:#999; font-size:12px;">内置</span>' : p.id}</td>
                <td><img src="${p.img}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/40/eee'"></td>
                <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</td>
                <td>¥${p.price}</td>
                <td style="white-space:nowrap;">
                    ${p.isFixed 
                        ? '<span style="color:#999; font-size:12px;">内置商品不可修改/删除</span>' 
                        : `<button class="admin-btn btn-orange" onclick="adminEditProduct('${p.id}')">修改</button>
                           <button class="admin-btn btn-red" onclick="adminDeleteProduct('${p.id}')">删除</button>`
                    }
                </td>
            </tr>
        `).join("");
      }

      function adminEditProduct(id) {
        const p = getData("products").find((x) => x.id == id);
        if (!p || p.isFixed) return;
        editingProductId = p.id;
        tempProductImageBase64 = p.img;
        document.getElementById("admin-prod-form-title").innerText = "修改商品信息 (ID: " + p.id + ")";
        document.getElementById("add-prod-name").value = p.name;
        document.getElementById("add-prod-price").value = p.price;
        document.getElementById("add-prod-desc").value = p.desc || "";
        document.getElementById("add-prod-img-file").value = "";
        document.getElementById("add-prod-img-preview").src = p.img;
        document.getElementById("add-prod-img-preview").style.display = "block";
        document.getElementById("btn-save-prod").innerText = "保存修改";
        document.getElementById("btn-save-prod").className = "admin-btn btn-green";
        document.getElementById("btn-cancel-prod").style.display = "block";
      }

      function cancelEditProduct() {
        editingProductId = null;
        tempProductImageBase64 = "";
        document.getElementById("admin-prod-form-title").innerText = "添加新商品";
        document.getElementById("add-prod-name").value = "";
        document.getElementById("add-prod-price").value = "";
        document.getElementById("add-prod-desc").value = "";
        document.getElementById("add-prod-img-file").value = "";
        document.getElementById("add-prod-img-preview").style.display = "none";
        document.getElementById("btn-save-prod").innerText = "+ 添加商品";
        document.getElementById("btn-save-prod").className = "admin-btn btn-blue";
        document.getElementById("btn-cancel-prod").style.display = "none";
      }

      function adminSaveProduct() {
        const name = document.getElementById("add-prod-name").value;
        const price = document.getElementById("add-prod-price").value;
        const desc = document.getElementById("add-prod-desc").value;
        if (!name || !price) { alert("商品名称和价格必填！"); return; }
        const finalImg = tempProductImageBase64 || "https://images.unsplash.com/photo-1544253372-e56d7ce7614e?w=400&q=80";

        let products = getData("products");
        try {
            if (editingProductId) {
              let idx = products.findIndex((p) => p.id == editingProductId);
              if (idx !== -1 && !products[idx].isFixed) {
                products[idx] = { ...products[idx], name, price, img: finalImg, desc };
              }
              setData("products", products);
              renderAdminProducts();
              renderHomeProducts();
              cancelEditProduct();
              setTimeout(() => alert("商品修改成功！"), 50);
            } else {
              const newId = Date.now();
              products.push({ id: newId, name, price, img: finalImg, desc });
              setData("products", products);
              renderAdminProducts();
              renderHomeProducts();
              cancelEditProduct();
              setTimeout(() => alert("商品添加成功！"), 50);
            }
        } catch(e) {
            alert("保存失败：可能是图片太大导致存储空间不足！");
        }
      }

      function adminDeleteProduct(id) {
        if (!confirm("确定删除该商品吗？前台展示也会移除。")) return;
        let products = getData("products").filter((p) => p.id != id);
        setData("products", products);
        renderAdminProducts();
        renderHomeProducts();
      }

      function renderAdminOrders() {
        const orders = getData("orders");
        const tbody = document.querySelector("#admin-order-table tbody");
        if (orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">暂无用户订单</td></tr>';
          return;
        }
        tbody.innerHTML = orders.map((o) => `
            <tr>
                <td>${o.id}</td>
                <td>${o.userAccount}</td>
                <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${o.productName}</td>
                <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${o.address}</td>
                <td style="color:${o.status === "pending_shipment" ? "red" : "#52c41a"}; font-weight:bold;">${statusMap[o.status]}</td>
                <td style="white-space:nowrap;">
                    ${o.status === "pending_shipment" ? `<button class="admin-btn btn-blue" onclick="adminProcessOrder('${o.id}', 'pending_receipt')">去发货</button>` : ""}
                    ${o.status === "pending_receipt" ? `<button class="admin-btn btn-green" onclick="adminProcessOrder('${o.id}', 'pending_review')">完成</button>` : ""}
                </td>
            </tr>
        `).join("");
      }

      function adminProcessOrder(orderId, nextStatus) {
        let orders = getData("orders");
        let order = orders.find((o) => o.id === orderId);
        if (order) {
          order.status = nextStatus;
          setData("orders", orders);
          renderAdminOrders();
          if (currentUser && currentUser.account === order.userAccount) updateMemberUI();
        }
      }

      function renderAdminUsers() {
        const users = getData("users");
        const tbody = document.querySelector("#admin-user-table tbody");
        tbody.innerHTML = users.map((u) => `
            <tr>
                <td style="white-space:nowrap;">${u.role === "admin" ? '<span style="color:red;font-weight:bold;">管理员</span>' : "普通用户"}</td>
                <td>${u.nickname || u.account}<br><small style="color:#999;">${u.account}</small></td>
                <td>${u.password}</td>
                <td style="text-align:center;">
                    <label style="cursor:pointer; display:inline-block; position:relative;" title="点击上传修改用户头像">
                        <img src="${u.avatar || "https://via.placeholder.com/40"}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid #ddd;" onerror="this.src='https://via.placeholder.com/40/eee'">
                        <input type="file" accept="image/*" style="display:none;" onchange="adminUpdateUserAvatar(this, '${u.account}')">
                    </label>
                </td>
                <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.address || '<span style="color:#ccc;">暂未填写</span>'}</td>
            </tr>
        `).join("");
      }

      function adminUpdateUserAvatar(inputEl, account) {
        if (inputEl.files && inputEl.files[0]) {
          fileToBase64(inputEl.files[0], (base64) => {
            let users = getData("users");
            let user = users.find((u) => u.account === account);
            if (user) {
              user.avatar = base64;
              setData("users", users);
              if (currentUser && currentUser.account === account) {
                currentUser.avatar = base64;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                updateMemberUI();
              }
              renderAdminUsers();
              alert("已成功为该用户更换头像！");
            }
          });
        }
      }

      // ================= 统一轮播图 =================
      function startCarousel(containerId, count) {
        let ci = document.getElementById(containerId);
        if (!ci) return;
        let index = 0;
        setInterval(() => {
          index = (index + 1) % count;
          ci.style.transform = `translateX(-${index * (100 / count)}%)`;
        }, 3500);
      }

      initApp();
      startCarousel("home-carousel-inner", 4);
      startCarousel("masters-carousel-inner", 4);