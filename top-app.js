// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: 'search.html', // ログイン成功後にリダイレクトするURL
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ],
};

// FirebaseUIのインスタンスを初期化
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// ユーザーのログイン状態の監視
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // ユーザーがログインしている場合
    document.getElementById('login-page').style.display = 'none';

    // 初回ログイン時にコレクションをコピー
    var userDocRef = firebase.firestore().collection('STATUS').doc(user.uid);
    userDocRef.get().then((doc) => {
      if (!doc.exists) { // 初回ログイン時はユーザードキュメントがまだ存在しない
        var batch = firebase.firestore().batch();

        firebase.firestore().collection('STATUS').get().then((collection) => {
          collection.forEach((doc) => {
            var userDoc = userDocRef.collection('status').doc(doc.id);
            batch.set(userDoc, { ...doc.data(), '強化済みフラグ': 0 });
          });
          batch.commit().catch((error) => console.error("Error committing batch: ", error));
        });
      }
    });

  } else {
    // ユーザーがログアウトしている場合
    document.getElementById('login-page').style.display = 'block';
    // Firebase UIのウィジェットを開始
    ui.start('#firebaseui-auth-container', uiConfig);
  }
}, function(error) {
  console.log(error);
});