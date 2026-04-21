import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';


export default function TabsLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1, backgroundColor: '#f8f9fa' }}
      >
        <LoadingSpinner
          message="Iniciando aplicación..."
          size="large"
        />
      </Animated.View>
    );
  }

  return (
    <ErrorBoundary>
      <Animated.View
        entering={FadeIn.duration(500)}
        style={{ flex: 1 }}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#ffffff',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: true,
            headerTintColor: '#ffffff',
            tabBarStyle: {
              backgroundColor: 'rgb(0, 0, 0)',
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              paddingBottom: 4,
              paddingTop: 4,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginBottom: 4,
            },
            tabBarIconStyle: {
              marginTop: 2,
            }
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
      </Animated.View>
    </ErrorBoundary>
  )
}
