// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { LocationService } from "./location.service";
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

  static async saveScore(mapId: string, playerName: string, newTime: number) {
    try {
      const region = await LocationService.getRegion();
      const country = region?.country || "Desconhecido";
      const state = region?.state || "Indefinido";

      const docRef = doc(db, "ranks", mapId, "scores", playerName);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as { time: number };
        const oldTime = data.time;
        
        if (newTime < oldTime) {
          await setDoc(docRef, {
            name: playerName,
            time: newTime,
            country,
            state,
            date: serverTimestamp()
          });
          console.log(`🏁 Novo recorde em ${mapId}: ${newTime}s (melhor que ${oldTime}s)`);
        } else {
          console.log(`⚪ Tempo ${newTime}s não superou o recorde atual (${oldTime}s).`);
        }
      } else {
        // ainda não há registro → cria
        await setDoc(docRef, {
          name: playerName,
          time: newTime,
          country,
          state,
          date: serverTimestamp()
        });
        console.log(`✅ Primeiro tempo salvo em ${mapId}: ${newTime}s`);
      }
    } catch (error) {
      console.error("❌ Erro ao salvar score:", error);
    }
  }

  static async getTopScores(mapId: string, regionFilter?: { country?: string, state?: string }) {
    try {
      const scoresRef = collection(db, "ranks", mapId, "scores");

      let q;
      if (regionFilter?.state) {
        // filtro por estado
        q = query(
          scoresRef,
          where("state", ">=", regionFilter.state),
          where("state", "<=", regionFilter.state + "\uf8ff"),
          orderBy("state"),
          orderBy("time", "asc"),
          limit(10)
        );
      } else if (regionFilter?.country) {
        // filtro por país
        q = query(scoresRef, where("country", "==", regionFilter.country), orderBy("time", "asc"), limit(10));
      } else {
        // mundial
        q = query(scoresRef, orderBy("time", "asc"), limit(10));
      }

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => {
        const data = d.data();
        // padroniza keys pra evitar undefined em tempo de render
        return {
          name: data["name"] || "---",
          time: typeof data["time"] === "number" ? data["time"] : Number.POSITIVE_INFINITY,
          country: data["country"] || null,
          state: data["state"] || null,
          date: data["date"] || null
        };
      });

      return results;
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
      return [];
    }
  }
}