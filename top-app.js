// Google認証プロバイダオブジェクトのインスタンス化
var googleProvider = new firebase.auth.GoogleAuthProvider();

// Facebook認証プロバイダオブジェクトのインスタンス化
var facebookProvider = new firebase.auth.FacebookAuthProvider();

// Googleサインインボタンにクリックイベントリスナを追加
document.getElementById('google-signin').addEventListener('click', function(event) {
    // デフォルトのリンククリックの動作を抑制
    event.preventDefault();
    // Googleサインインのポップアップウィンドウを表示
    firebase.auth().signInWithPopup(googleProvider).then(function(result) {
        // ユーザーがサインインした後の処理
        console.log('User signed in with Google');
    }).catch(function(error) {
        // エラーハンドリング
        console.error('Error occurred during Google sign-in', error);
    });
});

// Facebookサインインボタンにクリックイベントリスナを追加
document.getElementById('facebook-signin').addEventListener('click', function(event) {
    // デフォルトのリンククリックの動作を抑制
    event.preventDefault();
    // Facebookサインインのポップアップウィンドウを表示
    firebase.auth().signInWithPopup(facebookProvider).then(function(result) {
        // ユーザーがサインインした後の処理
        console.log('User signed in with Facebook');
    }).catch(function(error) {
        // エラーハンドリング
        console.error('Error occurred during Facebook sign-in', error);
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
