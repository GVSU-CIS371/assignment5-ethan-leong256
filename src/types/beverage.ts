interface BaseBeverageType {
  id: string;
  name: string;
  color: string;
}

interface CreamerType {
  id: string;
  name: string;
  color: string;
}

interface SyrupType {
  id: string;
  name: string;
  color: string;
}

type BeverageType = {
  id: string;
  uid: string;
  name: string;
  temp: string;
  base: BaseBeverageType;
  syrup: SyrupType | null;
  creamer: CreamerType;
};
export type { BaseBeverageType, CreamerType, SyrupType, BeverageType };
