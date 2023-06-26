// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: 'search.html', // ログイン成功後にリダイレクトするURL
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID
    ],
};

// FirebaseUIのインスタンスを初期化
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// ユーザーのログイン状態の監視
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // ユーザーがログインしている場合
      document.getElementById('login-page').style.display = 'none';
    } else {
      // ユーザーがログアウトしている場合
      document.getElementById('login-page').style.display = 'block';
      // Firebase UIのウィジェットを開始
      ui.start('#firebaseui-auth-container', uiConfig);
    }
}, function(error) {
    console.log(error);
});
