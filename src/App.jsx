import { useEffect, useState } from "react"
import { auth, db } from "./firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import Home from "./pages/Home"
import { toast } from 'react-toastify';
import { collection, setDoc } from "firebase/firestore";
import { getDocs, doc } from "firebase/firestore";
import { useGameContext } from "./context/game";
import chats from "./chat";

import Background from "./cmps/Background"

const makeName = (mail) => {
  let a = mail.split("@")[0];
  a = a.split("_")
  let prefix = ""
  if (a[0] === "team") {
    prefix = "team"
  } else {
    prefix = "(ind)"
  }
  a.shift("")
  return prefix + " " + a.join(" ")
}

const SignIn = ({ signin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAcc, setGameData, setInfo } = useGameContext()

  const signIn = (e) => {
    e.preventDefault();
    let json = {}
    signInWithEmailAndPassword(auth, email, password).then(async data => {
      json = {
        email: data.user.email,
        uid: data.user.uid,
        displayName: makeName(data.user.email)
      }
      setAcc(json)
      const col = collection(db, 'users')
      const a = await getDocs(col)
      const b = a.docs.map(doc => ({ data: doc.data() }))
      const exists = b.find(c => c.data.uid === json.uid)
      if (!exists) {
        setDoc(doc(db, 'users', (json.uid)), { uid: json.uid, level: 1, chats: chats, email: json.email, displayName: makeName(json.email), lastUpdate: Date.now() }).then(a => console.log(a))
        setGameData({ uid: json.uid, level: 1, chats, email: json.email, displayName: makeName(json.email) })
        setInfo({ uid: json.uid, level: 1, chats, email: json.email, displayName: makeName(json.email), lastUpdate: Date.now() })
      } else {
        setGameData({ uid: exists.data.uid, level: exists.data.level, chats: exists.data.chats, email: exists.data.email, displayName: makeName(exists.data.email), lastUpdate: exists.data.lastUpdate })
        setInfo({ uid: exists.data.uid, level: exists.data.level, chats: exists.data.chats, email: exists.data.email, displayName: makeName(exists.data.email), lastUpdate: exists.data.lastUpdate })
      }
      localStorage.setItem("user", JSON.stringify({ ...json }))
    }).catch(() => {
      toast("No such user lmao! Cannot even type properly")
    })
  };
  return <div className="w-screen h-screen flex justify-center items-center">
    <Background />
    <div className="z-[1223] ">
      <form onSubmit={signIn} className="flex z-[1223]  gap-8 flex-col items-center justify-center">
        <h1 className="text-6xl text-center font-extrabold mb-4">Welcome to cyquest</h1>
        <div className="relative bg-neutral" data-te-input-wrapper-init>
          <input type="text" className="bg-transparent p-4 w-[30rem] h-[4rem] outline-none" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="relative bg-[#222222]" data-te-input-wrapper-init>
          <input type="password" className=" bg-transparent p-4 w-[30rem] h-[4rem] outline-none" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="relative bg-[#222222]" data-te-input-wrapper-init>
        </div>
        <button type="submit" className="px-7 py-4 bg-neutral text-white flex items-center gap-4" onClick={signin}><img className="h-8 w-8" src="./signin.png" />
          Sign In With Email</button>
      </form>
    </div>
  </div>
}


const App = () => {
  const { acc, setAcc, setGameData, setInfo } = useGameContext()
  useEffect(() => {
    (async () => {
      if (!localStorage.getItem("user")) return
      const jdata = JSON.parse(localStorage.getItem("user"))
      if (!jdata) return
      setAcc(jdata)
      const col = collection(db, 'users')
      const a = await getDocs(col)
      const b = a.docs.map(doc => ({ data: doc.data() }))
      const exists = b.find(c => c.data.uid === jdata.uid)
      if (!exists) {
        setDoc(doc(db, 'users', (jdata.uid)), { uid: jdata.uid, level: 1, chats: chats, email: jdata.email, lastUpdate: Date.now() }).then(a => console.log(a))
        setGameData({ uid: jdata.uid, level: 1, chats: chats, lastUpdate: Date.now(), displayName: makeName(jdata.email), })
        setInfo({ uid: jdata.uid, level: 1, chats: chats, displayName: makeName(jdata.email), lastUpdate: Date.now() })
      } else {
        setGameData({ uid: exists.data.uid, level: exists.data.level, chats: exists.data.chats, email: exists.data.email, displayName: makeName(exists.data.email), lastUpdate: exists.data.lastUpdate })
        setInfo({ uid: exists.data.uid, level: exists.data.level, chats: exists.data.chats, email: exists.data.email, displayName: makeName(exists.data.email), lasUpdate: exists.data.lastUpdate })
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);
  return (
    <>
      {acc ? <Home /> : <SignIn />}
    </>
  )
}

export default App
