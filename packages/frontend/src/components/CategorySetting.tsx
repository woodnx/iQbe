// const categories = [
//   {
//     "id": 1,
//     "name": "文学",
//     "description": "文学関連の問題。大衆文学、神話、俳句・詩、童話、哲学を含む",
//     sub: [
//       {
//           "id": 1,
//           "name": "日本文学",
//           "description": "明治以降の日本の文学作品・作家など"
//       },
//       {
//           "id": 2,
//           "name": "古典文学",
//           "description": "江戸以前の日本の文学作品・作家など"
//       },
//       {
//           "id": 3,
//           "name": "世界文学",
//           "description": "日本以外の文学作品・作家など"
//       },
//       {
//           "id": 4,
//           "name": "神話",
//           "description": "日本神話、ローマ神話、北欧神話など"
//       },
//       {
//           "id": 5,
//           "name": "俳句・短歌・詩",
//           "description": "俳句・短歌・狂言・川柳・詩など、主に小説の形を取らない文学作品"
//       },
//       {
//           "id": 6,
//           "name": "童話・昔話",
//           "description": "童話や昔話など、子供向けの文学作品"
//       },
//       {
//         "id": 7,
//         "name": "倫理・哲学",
//         "description": "倫理学・哲学などに関する問題"
//       },
//       {
//         "id": 8,
//         "name": "その他",
//         "description": "その他文学に関する問題"
//       },
//     ]
//   },
//   {
//     "id": 2,
//     "name": "語学",
//     "description": "ことわざ、漢字、外国語など、言葉に関する問題",
//     sub: [
//       {
//         "id": 9,
//         "name": "ことわざ・慣用句",
//         "description": "ことわざ、慣用句、四字熟語など"
//       },
//       {
//         "id": 10,
//         "name": "ことば",
//         "description": "日常使われる言葉や、その語源など"
//       },
//       {
//         "id": 11,
//         "name": "外来語",
//         "description": "日本以外の言語や外来語、それらが語源となっている言葉など"
//       },
//       {
//         "id": 12,
//         "name": "その他",
//         "description": "日本語だけ・外国語だけではない問題"
//       },
//     ]
//   },
//   {
//     "id": 3,
//     "name": "科学",
//     "description": "いわゆる理系学問。科学関連の人物・賞、単位なども含まれる",
//     sub: [
//       {
//           "id": 13,
//           "name": "物理",
//           "description": "物理学用語・学者など"
//       },
//       {
//           "id": 14,
//           "name": "化学",
//           "description": "化学用語・学者など"
//       },
//       {
//           "id": 15,
//           "name": "医学",
//           "description": "医療や病気、人体、心理学など"
//       },
//       {
//           "id": 16,
//           "name": "生物",
//           "description": "動物や植物に関する問題で、他ジャンルに属さないもの"
//       },
//       {
//           "id": 17,
//           "name": "地学",
//           "description": "地震、岩石・鉱石、化石・恐竜など"
//       },
//       {
//           "id": 18,
//           "name": "気象",
//           "description": "気象用語など"
//       },
//       {
//           "id": 19,
//           "name": "天文",
//           "description": "宇宙、星座など"
//       },
//       {
//           "id": 20,
//           "name": "数学",
//           "description": "計算問題、数学用語など"
//       },
//       {
//           "id": 21,
//           "name": "単位",
//           "description": "単位、接頭語など"
//       },
//       {
//           "id": 22,
//           "name": "技術・IT",
//           "description": "コンピュータ、インターネットに関するもの"
//       },
//       {
//           "id": 23,
//           "name": "人物",
//           "description": "科学者、宇宙飛行士などの科学の人物"
//       },
//       {
//           "id": 24,
//           "name": "賞",
//           "description": "科学関係の賞など"
//       },
//       {
//           "id": 25,
//           "name": "その他",
//           "description": "生活科学など、その他で科学に分類される問題"
//       },
//     ]
//   },
//   {
//     "id": 4,
//     "name": "地理",
//     "description": "日本地理・世界地理どちらもこのジャンル",
//     sub: [
//       {
//         "id": 26,
//         "name": "世界地理",
//         "description": "世界の地名や地形・有名な建造物など"
//       },
//       {
//         "id": 27,
//         "name": "日本地理",
//         "description": "日本の地名や地形・有名な建造物など"
//       },
//       {
//         "id": 28,
//         "name": "その他",
//         "description": "地理用語など、その他地理に関する問題"
//       },
//     ]
//   },
//   {
//     "id": 5,
//     "name": "公民",
//     "description": "政治、経済、法律など。第二次世界大戦後の政治的・経済的事件などもこちら",
//     sub: [
//       {
//         "id": 29,
//         "name": "日本政治",
//         "description": "日本の戦後政治や選挙、機関など"
//       },
//       {
//           "id": 30,
//           "name": "国際政治",
//           "description": "日本以外の第二次世界大戦後の政治や法律、国際条約・紛争など"
//       },
//       {
//           "id": 31,
//           "name": "経済",
//           "description": "金融関係や商業取引、経済用語など"
//       },
//       {
//           "id": 32,
//           "name": "法律",
//           "description": "現行の法律など"
//       },
//       {
//           "id": 33,
//           "name": "その他",
//           "description": "教育学などその他公民分野に関する問題"
//       },
//     ]
//   },
//   {
//     "id": 6,
//     "name": "歴史",
//     "description": "世界史・日本史ともにこのジャンル。現代史は「公民」ジャンル",
//     sub: [
//       {
//         "id": 34,
//         "name": "世界史・人物",
//         "description": "世界史に登場する人物に関する問題"
//       },
//       {
//         "id": 35,
//         "name": "世界史・出来事",
//         "description": "世界史の中でも事件など出来事に関する問題"
//       },
//       {
//           "id": 36,
//           "name": "世界史・用語",
//           "description": "世界史に登場する用語に関する問題"
//       },
//       {
//           "id": 37,
//           "name": "日本史・人物",
//           "description": "日本史に登場する人物に関する問題"
//       },
//       {
//           "id": 38,
//           "name": "日本史・出来事",
//           "description": "日本史の中でも事件など出来事に関する問題"
//       },
//       {
//           "id": 39,
//           "name": "日本史・用語",
//           "description": "日本史に登場する用語に関する問題"
//       },
//       {
//           "id": 40,
//           "name": "その他",
//           "description": "それ以外の歴史に関する問題"
//       },
//     ]
//   },
//   {
//     "id": 7,
//     "name": "ライフスタイル",
//     "description": "食、交通、しきたり・マナー、会社・商品など。とにかく生活に関することならなんでも"
//   },
//   {
//     "id": 8,
//     "name": "芸能",
//     "description": "映画、テレビなど芸能関連の問題。VTuberや実況者などYoutube関連の問題はサブカル枠"
//   },
//   {
//     "id": 9,
//     "name": "美術",
//     "description": "古典芸能、絵画、彫刻、建築、ファッションなど、とにかく美術科で習うもの"
//   },
//   {
//     "id": 10,
//     "name": "音楽",
//     "description": "歌謡曲やJPOP、クラシックなどもこちら。器楽や楽譜、記号も含める"
//   },
//   {
//     "id": 11,
//     "name": "スポーツ",
//     "description": "野球などのスポーツ問題。競馬などの公営競技も含める。eスポーツはサブカル枠"
//   },
//   {
//     "id": 12,
//     "name": "サブカルチャー",
//     "description": "アニメ・ゲーム・漫画などのいわゆる青問"
//   },
//   {
//     "id": 13,
//     "name": "ノンセクション",
//     "description": "ジャンルの複合、分類不能な問題"
//   }
// ]

import { Group, Title } from "@mantine/core";
import CategoryCreateModalButton from "./CategoryCreateModalButton";
import CategoryCard from "./CategoryCard";
import { useCategories } from "@/hooks/useCategories";

export interface CategoryInputProps {
  
}

export default function CategoryInput({}: CategoryInputProps) {
  const { categories } = useCategories();

  const content = categories?.map(category => (
    <CategoryCard
      mt="md"
      id={category.id}
      name={category.name}
      description={category.description || ''}
      sub={category.sub || []}
      key={category.id}
    />
  ));

  return (
    <>
      <Group justify="space-between">
        <Title order={3} my="md">ジャンルの編集</Title>
        <CategoryCreateModalButton 
          isSub={false}
          parentId={undefined}
          parentName={undefined}
        />
      </Group>
      { content }
    </>
  );
}