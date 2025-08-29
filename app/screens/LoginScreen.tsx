import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { useLoginMutation } from '../api/Auth';
import { useDispatch } from 'react-redux';
import { setTokens } from '../features/authSlice';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();

  const onSubmit = async () => {
    try {
      const data = await login({ phone, password }).unwrap();
      dispatch(setTokens(data));
    } catch (e) {
      // handled by error state
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Helper</Text>
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={styles.error}>Login failed</Text>}
      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Logging in…' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: Colors.primary, marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: Colors.surface, borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: Colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: Colors.white, fontWeight: '600' },
  error: { color: 'red', marginBottom: 8 },
});

export default LoginScreen;
