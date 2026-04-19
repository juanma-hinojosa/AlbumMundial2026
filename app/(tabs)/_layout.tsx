import { useAuth } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e7e7e7ff' }}>
        <ActivityIndicator size="large" color="#2A398D" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2A398D',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#e7e7e7ff',
        },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="stickerAlbum"
        options={{
          title: 'Album',
          tabBarIcon: ({ color, focused }) => (<AntDesign name="book" size={24} color={color} />)
        }}
      />

      <Tabs.Screen
        name="fixture"
        options={{
          title: 'Fixture',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="merge" size={24} color={color} />
        }}
      />

      <Tabs.Screen
        name="exchange"
        options={{
          title: 'Cambiar',
          tabBarIcon: ({ color }) => <Ionicons name="qr-code-outline" size={24} color={color} />,
        }}
      />

      {/* LOGIN: Desaparece si 'user' existe */}
      <Tabs.Screen
        name="Login"
        options={{
          title: 'Cuenta',
          href: user ? null : undefined,
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />

    </Tabs>
  )
}
