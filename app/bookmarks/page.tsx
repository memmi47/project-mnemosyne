import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";
import { BookmarksClientView } from "@/components/bookmarks-client-view";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const dataset = await loadLearningObjects();

  // 정적 단어 뜻 및 유닛 정보 매핑
  const loMapJson: Record<string, { definition_ko: string; unit?: number }> = {};
  dataset.learning_objects.forEach((obj) => {
    loMapJson[obj.learning_object_id] = {
      definition_ko: obj.definition_ko,
      unit: (obj as unknown as { unit?: number }).unit,
    };
  });

  return <BookmarksClientView loMapJson={loMapJson} />;
}
