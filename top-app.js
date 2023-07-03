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

// Initialize local storage for STATUS collection
function initializeUserStatusTable(user) {
  if (!localStorage.getItem(user.uid)) {
      let userStatusTable = {};
      db.collection("STATUS").doc(user.uid).collection('status').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              let data = doc.data();
              data.id = doc.id;
              userStatusTable[data.id] = data;
          });
          localStorage.setItem(user.uid, JSON.stringify(userStatusTable));
      }).catch((error) => {
          console.error("Error fetching documents from 'STATUS' collection: ", error);
      });
  }
}

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
        var batch = firebase.firestore().batch();
        var operationCounter = 0;
    
        collection.forEach((doc) => {
            var userDoc = userDocRef.collection('status').doc(doc.id + '-' + user.uid);
            batch.set(userDoc, { ...doc.data(), '強化済みフラグ': 0, 'originalDocId': doc.id });
            operationCounter++;
    
            if (operationCounter === 500) {
                // コミットして新しいバッチを開始する
                batch.commit();
                batch = firebase.firestore().batch();
                operationCounter = 0;
            }
        });
        
        if (operationCounter > 0) {
            batch.commit().catch((error) => console.error("Error committing batch: ", error));
        }
      });
    }
  });

  // ローカルストレージにSTATUSコレクションを初期化
  initializeUserStatusTable(user);

} else {
  // ユーザーがログアウトしている場合
  document.getElementById('login-page').style.display = 'block';
  // Firebase UIのウィジェットを開始
  ui.start('#firebaseui-auth-container', uiConfig);
}
}, function(error) {
console.log(error);
});
