// Hàm đăng nhập để lấy token
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
    }
    return data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
  }
}

// Hàm kiểm tra nếu người dùng là admin
function isAdminUser() {
  const role = localStorage.getItem('role');
  return role === 'admin';
}

// Hàm lấy danh sách món ăn
async function fetchMenuItems() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('http://localhost:4000/api/menu-items', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      console.log('Vui lòng đăng nhập!');
      return;
    }
    const menuItems = await response.json();
    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = menuItems.map(item => `<p>${item.name} - $${item.price}</p>`).join('');
  } catch (error) {
    console.error('Lỗi lấy danh sách món ăn:', error);
  }
}

// Hàm thêm món ăn
async function addMeal(mealData) {
  if (!isAdminUser()) {
    alert('Chỉ admin mới có quyền thêm món ăn!');
    return;
  }
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('http://localhost:4000/api/meals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mealData)
    });
    const result = await response.json();
    console.log(result);
    alert(result.message);
    fetchMenuItems(); // Cập nhật danh sách sau khi thêm
  } catch (error) {
    console.error('Lỗi thêm món ăn:', error);
  }
}

// Hàm sửa món ăn
async function updateMeal(id, mealData) {
  if (!isAdminUser()) {
    alert('Chỉ admin mới có quyền sửa món ăn!');
    return;
  }
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:4000/api/meals/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mealData)
    });
    const result = await response.json();
    console.log(result);
    alert(result.message);
    fetchMenuItems(); // Cập nhật danh sách sau khi sửa
  } catch (error) {
    console.error('Lỗi sửa món ăn:', error);
  }
}

// Hàm xóa món ăn
async function deleteMeal(id) {
  if (!isAdminUser()) {
    alert('Chỉ admin mới có quyền xóa món ăn!');
    return;
  }
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:4000/api/meals/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    console.log(result);
    alert(result.message);
    fetchMenuItems(); // Cập nhật danh sách sau khi xóa
  } catch (error) {
    console.error('Lỗi xóa món ăn:', error);
  }
}

// Xử lý sự kiện trong admin.html
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('add-meal-form')) {
    document.getElementById('add-meal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const mealData = {
        id: parseInt(document.getElementById('meal-id').value),
        name: document.getElementById('meal-name').value,
        category: document.getElementById('meal-category').value,
        nation: document.getElementById('meal-nation').value || null,
        image: document.getElementById('meal-image').value || null,
        price: parseFloat(document.getElementById('meal-price').value),
        availability: document.getElementById('meal-availability').checked
      };
      await addMeal(mealData);
    });

    document.getElementById('update-meal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById('update-meal-id').value);
      const mealData = {
        name: document.getElementById('update-meal-name').value || undefined,
        price: document.getElementById('update-meal-price').value ? parseFloat(document.getElementById('update-meal-price').value) : undefined
      };
      await updateMeal(id, mealData);
    });

    document.getElementById('delete-meal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById('delete-meal-id').value);
      await deleteMeal(id);
    });
  }

  // Tự động tải danh sách món ăn khi vào menu.html
  if (document.getElementById('menu-list')) {
    fetchMenuItems();
  }
});