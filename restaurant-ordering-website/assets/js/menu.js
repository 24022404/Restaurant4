const menuItems = [
    {
        id: 1,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella and basil.",
        price: 10.99,
        category: "Pizza",
        image: "assets/images/margherita.jpg"
    },
    {
        id: 2,
        name: "Caesar Salad",
        description: "Crisp romaine lettuce with Caesar dressing and croutons.",
        price: 7.99,
        category: "Salad",
        image: "assets/images/caesar.jpg"
    },
    {
        id: 3,
        name: "Spaghetti Carbonara",
        description: "Pasta with creamy sauce, pancetta, and parmesan.",
        price: 12.99,
        category: "Pasta",
        image: "assets/images/carbonara.jpg"
    },
    {
        id: 4,
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone.",
        price: 5.99,
        category: "Dessert",
        image: "assets/images/tiramisu.jpg"
    }
];

function displayMenuItems() {
    const menuContainer = document.getElementById('menu-container');
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span>$${item.price.toFixed(2)}</span>
            <button onclick="addToCart(${item.id})">Add to Cart</button>
        `;
        menuContainer.appendChild(menuItem);
    });
}

function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        // Logic to add item to cart
        alert(`${item.name} has been added to your cart!`);
    }
}

document.addEventListener('DOMContentLoaded', displayMenuItems);