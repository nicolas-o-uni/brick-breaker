// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2lAaSoSbiyiT2o-gjGFL-olD8SEjjVos",
  authDomain: "brick-breaker-rank.firebaseapp.com",
  projectId: "brick-breaker-rank",
  storageBucket: "brick-breaker-rank.firebasestorage.app",
  messagingSenderId: "1061128618243",
  appId: "1:1061128618243:web:a8d9414d12c2bee9dfa936"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class RankService {

  static async saveScore(mapId: string, name: string, time: number) {
    try {
      const playerDoc = doc(db, "ranks", mapId, "scores", name); // 🔹 nome do jogador = ID do doc
      await setDoc(playerDoc, {
        name,
        time,
        date: serverTimestamp(),
      });
      console.log(`✅ Score salvo para ${name}!`);
    } catch (error) {
      console.error("❌ Erro ao salvar score:", error);
    }
  }

  static async getTopScores(mapId: string) {
    const scoresRef = collection(db, "ranks", mapId, "scores");
    const q = query(scoresRef, orderBy("score", "asc"), limit(10)); // menor tempo = melhor
    const snapshot = await getDocs(q);

    const results = snapshot.docs.map(doc => doc.data());
    console.log("🏆 Ranking:", results);
    return results;
  }
}