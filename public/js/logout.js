function logout() {
    document.cookie = "tokenId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/'
    alert('Bạn đã đăng xuất')
}