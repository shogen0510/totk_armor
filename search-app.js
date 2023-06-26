// ユーザーのログイン状態の監視
firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // ユーザーがログアウトしている場合、ログインページにリダイレクト
        window.location.href = "top.html";
    }
});
