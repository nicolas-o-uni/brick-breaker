// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
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

// Estrutura do dado
export interface RankEntry {
  name: string;
  level: string;
  time: number; // segundos
  timestamp: number;
}

export class RankService {

  static async submitScore(entry: RankEntry) {
    try {
      await addDoc(collection(db, "ranks"), entry);
      console.log("🏆 Score salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar score:", error);
    }
  }

  static async getTopScores(level: string, top: number = 10): Promise<RankEntry[]> {
    try {
      const q = query(
        collection(db, "ranks"),
        orderBy("time", "asc"),
        limit(top)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => doc.data() as RankEntry)
        .filter(entry => entry.level === level);
    } catch (error) {
      console.error("Erro ao buscar rank:", error);
      return [];
    }
  }
}