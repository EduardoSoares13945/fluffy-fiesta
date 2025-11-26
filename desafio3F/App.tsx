import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  listarJogos,
  criarJogo,
  atualizarJogo,
  excluirJogo,
  type Game,
} from './src/services/api';

export default function App() {
  const [jogos, setJogos] = useState<Game[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Campos do formulário
  const [titulo, setTitulo] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [genero, setGenero] = useState('');
  const [ano, setAno] = useState('');
  const [nota, setNota] = useState('');

  const emEdicao = useMemo(() => editandoId !== null, [editandoId]);

  useEffect(() => {
    (async () => {
      try {
        const lista = await listarJogos();
        setJogos(lista);
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível carregar os jogos.');
      }
    })();
  }, []);

  const limparFormulario = () => {
    setTitulo('');
    setPlataforma('');
    setGenero('');
    setAno('');
    setNota('');
    setEditandoId(null);
  };

  const validar = (): boolean => {
    if (!titulo.trim()) {
      Alert.alert('Validação', 'Informe um título.');
      return false;
    }
    if (ano.trim()) {
      const n = Number(ano);
      if (!Number.isInteger(n) || n < 1970 || n > 2100) {
        Alert.alert('Validação', 'Ano deve ser inteiro entre 1970 e 2100.');
        return false;
      }
    }
    if (nota.trim()) {
      const x = Number(nota);
      if (Number.isNaN(x) || x < 0 || x > 10) {
        Alert.alert('Validação', 'Nota deve estar entre 0 e 10.');
        return false;
      }
    }
    return true;
  };

  const salvar = async () => {
    if (!validar()) return;

    const anoNum = ano.trim() ? Number(ano) : undefined;
    const notaNum = nota.trim() ? Number(nota) : undefined;

    try {
      if (emEdicao && editandoId !== null) {
        await atualizarJogo(editandoId, {
          titulo: titulo.trim(),
          plataforma: plataforma.trim(),
          genero: genero.trim(),
          ano: anoNum,
          nota: notaNum,
        });
      } else {
        await criarJogo({
          titulo: titulo.trim(),
          plataforma: plataforma.trim(),
          genero: genero.trim(),
          ano: anoNum,
          nota: notaNum,
        });
      }
      const lista = await listarJogos();
      setJogos(lista);
      limparFormulario();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar o jogo.');
    }
  };

  const iniciarEdicao = (game: Game) => {
    setEditandoId(game.id);
    setTitulo(game.titulo);
    setPlataforma(game.plataforma);
    setGenero(game.genero);
    setAno(game.ano ? String(game.ano) : '');
    setNota(game.nota !== undefined ? String(game.nota) : '');
  };

  const remover = (id: number) => {
    Alert.alert('Remover', 'Deseja excluir este jogo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirJogo(id);
            const lista = await listarJogos();
            setJogos(lista);
          } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Não foi possível excluir o jogo.');
          }
        },
      },
    ]);
  };

  const Item = ({ item }: { item: Game }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardSubtitle}>
          {item.plataforma || 'Plataforma indefinida'}
          {item.ano ? ` • ${item.ano}` : ''}
        </Text>
        <Text style={styles.cardMeta}>
          {item.genero || 'Gênero indefinido'}
          {item.nota !== undefined ? ` • Nota: ${item.nota}` : ''}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => iniciarEdicao(item)}>
          <Text style={[styles.btnText, styles.btnGhostText]}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnDanger]} onPress={() => remover(item.id)}>
          <Text style={styles.btnText}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <Text style={styles.title}>CRUD • Jogos</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Título (obrigatório)"
            value={titulo}
            onChangeText={setTitulo}
            style={styles.input}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Plataforma (ex.: PC, PS5)"
            value={plataforma}
            onChangeText={setPlataforma}
            style={styles.input}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Gênero (ex.: Ação, RPG)"
            value={genero}
            onChangeText={setGenero}
            style={styles.input}
            returnKeyType="next"
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Ano (1970-2100)"
              value={ano}
              onChangeText={(t) => setAno(t.replace(/[^0-9]/g, ''))}
              style={[styles.input, styles.inputHalf]}
              keyboardType="number-pad"
              maxLength={4}
            />
            <TextInput
              placeholder="Nota (0-10)"
              value={nota}
              onChangeText={(t) => setNota(t.replace(/[^0-9.,]/g, '').replace(',', '.'))}
              style={[styles.input, styles.inputHalf]}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={salvar}>
              <Text style={styles.btnText}>{emEdicao ? 'Atualizar' : 'Adicionar'}</Text>
            </Pressable>
            {emEdicao && (
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={limparFormulario}>
                <Text style={[styles.btnText, styles.btnGhostText]}>Cancelar</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>
            {jogos.length ? `Jogos (${jogos.length})` : 'Nenhum jogo adicionado'}
          </Text>
        </View>

        <FlatList
          data={jogos}
          keyExtractor={(item) => String(item.id)}
          renderItem={Item}
          contentContainerStyle={jogos.length ? undefined : { flex: 1, justifyContent: 'center' }}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Adicione seu primeiro jogo acima.</Text>
          )}
          style={{ alignSelf: 'stretch' }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1020' },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F0F4FF',
    textAlign: 'center',
    marginVertical: 8,
  },
  form: {
    backgroundColor: '#121735',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    backgroundColor: '#0f1430',
    borderWidth: 1,
    borderColor: '#2b3468',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E6ECFF',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  inputHalf: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#4C6FFF',
  },
  btnDanger: {
    backgroundColor: '#FF4C61',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a4480',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnGhostText: {
    color: '#B1B9F3',
  },
  listHeader: {
    paddingHorizontal: 4,
  },
  listHeaderText: {
    color: '#DDE3FF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#13193b',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    color: '#F3F6FF',
    fontWeight: '700',
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#BFD1FF',
    marginTop: 2,
  },
  cardMeta: {
    color: '#8FA4FF',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#A9B6F7',
  },
});
