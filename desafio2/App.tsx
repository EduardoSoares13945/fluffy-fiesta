import "react-native-gesture-handler";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  NavigationContainer,
  DrawerActions,
  DefaultTheme as NavLight,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Text,
  Button,
  Card,
  Icon,
  ActivityIndicator,
} from "react-native-paper";

type RootDrawerParamList = {
  Principal: undefined;
  Sobre: undefined;
};

type RootStackParamList = {
  Tabs: undefined;
  Detalhes: { from?: string } | undefined;
};

type WikiPost = {
  id: string;
  title: string;
  description: string;
  url: string;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: "#FAFAFA",
    surface: "#FFFFFF",
  },
};

const navTheme = {
  ...NavLight,
  colors: {
    ...NavLight.colors,
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#1F2937",
    border: "#E5E7EB",
  },
};

// ---------- COMPONENTE DE CABEÇALHO ----------
function Header({ title, navigation }: any) {
  return (
    <Appbar.Header mode="center-aligned">
      <Appbar.Action
        icon="menu"
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

// ---------- HOME ----------
function HomeScreen({ navigation }: any) {
  return (
    <ScreenContainer>
      <Card mode="elevated">
        <Card.Title
          title="Home"
          left={(props) => <Icon source="home" size={24} {...props} />}
        />
        <Card.Content>
          <Text>Bem-vindo! Esta é a aba Home.</Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Detalhes", { from: "Home" })}
          >
            Ir para Detalhes
          </Button>
        </Card.Actions>
      </Card>
    </ScreenContainer>
  );
}

// ---------- FEED (com uso da API Wikipedia) ----------
function FeedScreen() {
  const [posts, setPosts] = useState<WikiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWiki() {
      try {
        const today = new Date();
        const YYYY = today.getFullYear();
        const MM = String(today.getMonth() + 1).padStart(2, "0");
        const DD = String(today.getDate()).padStart(2, "0");

        const url = `https://api.wikimedia.org/feed/v1/wikipedia/pt/featured/${YYYY}/${MM}/${DD}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "MeuAppReactNative/1.0 (contato@exemplo.com)",
          },
        });
        const data = await res.json();

        const items: WikiPost[] = [];

        // Artigo em destaque (TFA)
        if (data.tfa) {
          items.push({
            id: data.tfa.pageid?.toString() || "tfa",
            title: data.tfa.displaytitle || data.tfa.title,
            description: data.tfa.extract || "Sem descrição.",
            url: data.tfa.content_urls.desktop.page,
          });
        }

        // Mais lidas
        if (data.mostread?.articles) {
          for (const art of data.mostread.articles) {
            items.push({
              id: art.pageid?.toString() || art.title,
              title: art.title,
              description: art.extract || `Visualizações: ${art.views}`,
              url: art.content_urls?.desktop?.page,
            });
          }
        }

        setPosts(items);
      } catch (err) {
        console.error("Erro ao buscar dados da Wikipedia:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWiki();
  }, []);

  return (
    <ScreenContainer>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Carregando artigos...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 16 }}>
          {posts.map((post) => (
            <Card key={post.id} mode="elevated">
              <Card.Title
                title={post.title}
                left={(props) => <Icon source="book" size={24} {...props} />}
              />
              <Card.Content>
                <Text variant="bodyMedium">{post.description}</Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="outlined"
                  onPress={() => {
                    // Abre a página no navegador (poderia usar Linking)
                    console.log("Abrir:", post.url);
                  }}
                >
                  Ver na Wikipedia
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

// ---------- TABS ----------
function TabsScreen() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarStyle: { backgroundColor: "#FFFFFF" },
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === "Home" ? "home" : "rss";
          return <Icon source={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Feed" component={FeedScreen} />
    </Tabs.Navigator>
  );
}

// ---------- DETALHES ----------
function DetalhesScreen({ route, navigation }: any) {
  const from = route?.params?.from ?? "—";
  return (
    <>
      <Header title="Detalhes" navigation={navigation} />
      <ScreenContainer>
        <Card>
          <Card.Title
            title="Tela de Detalhes"
            left={(p) => <Icon source="file-document" size={24} {...p} />}
          />
          <Card.Content>
            <Text>Você veio de: {from}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.goBack()}>Voltar</Button>
          </Card.Actions>
        </Card>
      </ScreenContainer>
    </>
  );
}

// ---------- STACK PRINCIPAL ----------
function StackPrincipal({ navigation }: any) {
  return (
    <>
      <Header title="Principal" navigation={navigation} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabsScreen} />
        <Stack.Screen name="Detalhes" component={DetalhesScreen} />
      </Stack.Navigator>
    </>
  );
}

// ---------- SOBRE ----------
function SobreScreen({ navigation }: any) {
  return (
    <>
      <Header title="Sobre" navigation={navigation} />
      <ScreenContainer>
        <Card>
          <Card.Title
            title="Sobre o App"
            left={(p) => <Icon source="information" size={24} {...p} />}
          />
          <Card.Content>
            <Text>
              Exemplo completo com React Native Paper + Drawer + Tabs + Stack.
            </Text>
          </Card.Content>
        </Card>
      </ScreenContainer>
    </>
  );
}

// ---------- CONTAINER GENÉRICO ----------
function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

// ---------- APP ROOT ----------
export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: "#2563EB",
            drawerStyle: { backgroundColor: "#FFFFFF" },
          }}
        >
          <Drawer.Screen
            name="Principal"
            component={StackPrincipal}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon source="view-dashboard" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Sobre"
            component={SobreScreen}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon source="information-outline" size={size} color={color} />
              ),
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAFAFA",
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});
