import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Post = { id: string; title: string; body: string };

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const today = new Date();
  const YYYY = today.getFullYear();
  const MM = String(today.getMonth() + 1).padStart(2, "0");
  const DD = String(today.getDate()).padStart(2, "0");

  const API_URL = `https://api.wikimedia.org/feed/v1/wikipedia/pt/featured/${YYYY}/${MM}/${DD}`;

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: {
          "User-Agent": "desafio1/1.0 (email@exemplo.com)",
        },
      });
      const data = await res.json();

      const items: Post[] = [];

      // Artigo em destaque do dia
      if (data.tfa) {
        items.push({
          id: data.tfa.pageid?.toString() || "tfa",
          title: data.tfa.displaytitle || data.tfa.title,
          body: data.tfa.extract || "Sem descrição.",
        });
      }

      // Artigos mais lidos
      if (data.mostread?.articles) {
        for (const art of data.mostread.articles) {
          items.push({
            id: art.pageid?.toString() || art.title,
            title: art.title,
            body: art.extract || `Visualizações: ${art.views}`,
          });
        }
      }

      setPosts(items);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = query
    ? posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : posts;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Buscar por título..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        onRefresh={load}
        refreshing={refreshing}
        ListEmptyComponent={<Text style={styles.muted}>Nenhum resultado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text numberOfLines={3} style={styles.cardBody}>
              {item.body}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: "#666" },
  input: {
    margin: 16,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderColor: "#DDD",
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    borderColor: "#EEE",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: { fontWeight: "700", marginBottom: 4, fontSize: 16 },
  cardBody: { color: "#444" },
});
