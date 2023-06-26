// Google認証プロバイダオブジェクトのインスタンス化
var provider = new firebase.auth.GoogleAuthProvider();

// Googleサインインボタンにクリックイベントリスナを追加
document.getElementById('google-signin').addEventListener('click', function(event) {
    // デフォルトのリンククリックの動作を抑制
    event.preventDefault();
    // Googleサインインのポップアップウィンドウを表示
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // ユーザーがサインインした後の処理
        console.log('User signed in');
    }).catch(function(error) {
        // エラーハンドリング
        console.error('Error occurred during sign-in', error);
    });
});

// ユーザーのログイン状態の監視
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // ユーザーがログインしている場合
        document.getElementById('login-page').style.display = 'none';
        // ログイン成功後、search.htmlページにリダイレクト
        window.location.href = "search.html";
    } else {
        // ユーザーがログアウトしている場合
        document.getElementById('login-page').style.display = 'block';
    }
});
