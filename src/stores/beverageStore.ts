import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import bases from "../data/bases.json";
import syrups from "../data/syrups.json";
import creamers from "../data/creamers.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  QuerySnapshot,
  QueryDocumentSnapshot,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    user: null as User | null,
    snapshotUnsubscribe: null as Unsubscribe | null,
  }),

  actions: {
    init() {
      const baseCollection = collection(db, "bases");
      getDocs(baseCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            bases.forEach((b) => {
              const base = doc(db, `bases/${b.id}`);
              setDoc(base, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New base with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.bases = bases;
          } else {
            this.bases = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as BaseBeverageType[];
          }
          this.currentBase = this.bases[0];
          console.log("getting bases: ", this.bases);
        })
        .catch((error: any) => {
          console.error("Error getting documents:", error);
        });
      const syrupCollection = collection(db, "syrups");
      getDocs(syrupCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            syrups.forEach((b) => {
              const syrup = doc(db, `syrups/${b.id}`);
              setDoc(syrup, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New syrup with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.syrups = syrups;
          } else {
            this.syrups = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as SyrupType[];
            console.log("getting syrups: ", this.syrups);
          }
          this.currentSyrup = this.syrups[0];
        })
        .catch((error: any) => {
          console.error("Error getting syrups:", error);
        });

      const creamerCollection = collection(db, "creamers");
      getDocs(creamerCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            creamers.forEach((b) => {
              const creamer = doc(db, `creamers/${b.id}`);
              setDoc(creamer, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New creamer with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.creamers = creamers;
          } else {
            this.creamers = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as CreamerType[];

            console.log("getting creamers: ", this.creamers);
          }
          this.currentCreamer = this.creamers[0];
        })
        .catch((error: any) => {
          console.error("Error getting creamers:", error);
        });
    },

    showBeverage() {
      if (!this.currentBeverage) return;
      this.currentName = this.currentBeverage.name;
      this.currentTemp = this.currentBeverage.temp;
      this.currentBase = this.currentBeverage.base;
      this.currentSyrup = this.currentBeverage.syrup;
      this.currentCreamer = this.currentBeverage.creamer;
      console.log(
        `currentBeverage changed`,
        this.currentBase,
        this.currentCreamer,
        this.currentSyrup
      );
    },
    makeBeverage() {
      if (!this.user) { // makes sure user is signed in
        return "No user logged in, Please sign in first";
      }

      if (!this.currentBase || !this.currentCreamer || !this.currentSyrup) { // make sure all ingredientns exists
        return "Please select a base, creamer, and syrup.";
      }

      const beverageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`; // Unique Beverage ID

      const newDrink: BeverageType = { // make new drink
        id: beverageId,
        name: this.currentName || `Drink-${this.beverages.length + 1}`,
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
        uid: this.user.uid
      };


      const beverageRef = doc( // path in firestore
        db,
        "users", // users collection
        this.user.uid, // user id subcollection
        "beverages", // beverage subcollection
        beverageId // document holding user drink
      );

      setDoc(beverageRef, newDrink) // writes user drink data to firestore
        .catch((e) => console.error("Beverage not saved: ", e)); // error handling if something happens during write

      this.beverages.push(newDrink); // add drink to pinia store
      this.currentBeverage = newDrink; // display drink in mug

      return `Beverage ${this.currentName} saved succesfully!`
    },

    setUser(user: User | null) { // sets current user
      this.user = user;

      // stop listening
      if (this.snapshotUnsubscribe) {
        this.snapshotUnsubscribe();
        this.snapshotUnsubscribe = null;
      }

      if (!user) { // if signed out clear beverage choices
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      // start new listner
      const beverageCollection = collection(
        db, // users collection
        "users", // user id subcollection
        user.uid, // beverage subcollection
        "beverages" // document holding user drink
      );

      const beveragequery = query( // make sql command
        beverageCollection, // get beverage document
        where("uid", "==", user.uid) // where user id = current user id
      );

      this.snapshotUnsubscribe = onSnapshot(beveragequery, (snapshot) => { // make listener
        const bev: BeverageType[] = snapshot.docs.map((doc) => { // array of user saved Beverages
          return {
            ...(doc.data() as BeverageType), // gets fields from beverages document
            // the '...' automatically uts fields into onjects
            id: doc.id, // unique id for each beverage
          };
        });

        this.beverages = bev; // update user beverages array

        if (bev.length > 0) { // if beverage exists
          if ( // if current beverage in firestore
            this.currentBeverage &&
            bev.some((d) => d.id === this.currentBeverage!.id)
          ) {
            this.currentBeverage = bev.find((x) => x.id === this.currentBeverage!.id) || null; // find matching beverage and set as current
          } else {
            this.currentBeverage = bev[0]; // if beverage not in firestore select first user saved drink
          }
        } else {
          this.currentBeverage = null; // no drink available
        }
      });
    },
  },
});
