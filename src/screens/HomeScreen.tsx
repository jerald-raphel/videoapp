// import React from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../App';

// type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// const videos = [
//   { id: 1, name: 'Video 1' },
//   { id: 2, name: 'Video 2' },
//   { id: 3, name: 'Video 3' },
// ];

// const HomeScreen: React.FC<Props> = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select a Video</Text>
//       <FlatList
//         data={videos}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.item}
//             onPress={() => navigation.navigate('Video', { video: item.id })}
//           >
//             <Text style={styles.itemText}>{item.name}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   item: { padding: 15, backgroundColor: '#eee', marginBottom: 10, borderRadius: 8 },
//   itemText: { fontSize: 18 },
// });


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { launchImageLibrary } from "react-native-image-picker";
// import { PermissionsAndroid } from "react-native";
// import { RootStackParamList } from "../../App";

// type Project = {
//   id: string;
//   name: string;
//   size: string;
//   uri?: string;
// };

// type Props = NativeStackScreenProps<RootStackParamList, "Home">;

// const HomeScreen: React.FC<Props> = ({ navigation }) => {
//   const [projects, setProjects] = useState<Project[]>([]);

//   const loadProjects = async () => {
//     const raw = await AsyncStorage.getItem("projects");
//     setProjects(
//       raw
//         ? JSON.parse(raw)
//         : [{ id: "1", name: "Museb Project", size: "11.1 MB" }]
//     );
//   };

//   const saveProjects = async (newProjects: Project[]) => {
//     setProjects(newProjects);
//     await AsyncStorage.setItem("projects", JSON.stringify(newProjects));
//   };

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const requestStoragePermission = async () => {
//     if (Platform.OS !== "android") return true;
//     if (Platform.Version >= 33) {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
//         {
//           title: "Media Permission",
//           message: "App needs access to your videos to select a video",
//           buttonPositive: "OK",
//           buttonNegative: "Cancel",
//           buttonNeutral: "Ask Me Later",
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } else {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//         {
//           title: "Storage Permission",
//           message: "App needs access to your storage to select videos",
//           buttonPositive: "OK",
//           buttonNegative: "Cancel",
//           buttonNeutral: "Ask Me Later",
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//   };

//   const handleNewProject = async () => {
//     const hasPermission = await requestStoragePermission();
//     if (!hasPermission) {
//       Alert.alert(
//         "Permission Denied",
//         "Cannot access gallery without permission"
//       );
//       return;
//     }

//     const result = await launchImageLibrary({
//       mediaType: "video",
//       selectionLimit: 1,
//     });

//     if (!result.assets || !result.assets[0].uri) return;

//     const uri = result.assets[0].uri;
//     const name = `Project ${projects.length + 1}`;
//     const size = "Unknown";
//     const newProject: Project = { id: String(Date.now()), name, size, uri };
//     saveProjects([...projects, newProject]);
//   };

//   const renderProjectItem = ({ item }: { item: Project }) => (
//     <TouchableOpacity
//       style={styles.projectCard}
//       onPress={() => item.uri && navigation.navigate("Video", { video: item.uri })}
//     >
//       <View style={styles.projectImage} />
//       <Text style={styles.projectName}>{item.name}</Text>
//       <Text style={styles.projectSize}>{item.size}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <Text style={styles.workspaceTitle}>Workspace</Text>
//         <Text style={styles.projectCount}>{projects.length} Projects</Text>

//         <FlatList
//           data={projects}
//           keyExtractor={(item) => item.id}
//           renderItem={renderProjectItem}
//           ListFooterComponent={() => (
//             <TouchableOpacity style={styles.newProjectCard} onPress={handleNewProject}>
//               <Text style={styles.newProjectCardIcon}>+</Text>
//               <Text style={styles.newProjectText}>New Project</Text>
//             </TouchableOpacity>
//           )}
//           contentContainerStyle={styles.listContent}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#1c1c1e" },
//   container: { flex: 1, padding: 15 },
//   workspaceTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 20 },
//   projectCount: { fontSize: 14, color: "#8e8e93", marginBottom: 20 },
//   listContent: { paddingBottom: 20 },
//   projectCard: {
//     backgroundColor: "#2c2c2e",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//   },
//   projectImage: { height: 120, backgroundColor: "#6c5ce7", borderRadius: 8 },
//   projectName: { color: "#fff", fontSize: 18, marginTop: 10 },
//   projectSize: { color: "#ccc", fontSize: 14 },
//   newProjectCard: {
//     marginTop: 20,
//     height: 150,
//     backgroundColor: "#2c2c2e",
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#444",
//     borderStyle: "dashed",
//   },
//   newProjectCardIcon: { fontSize: 40, color: "#666" },
//   newProjectText: { marginTop: 10, color: "#8e8e93", fontSize: 16 },
// });



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { launchImageLibrary } from "react-native-image-picker";
import { PermissionsAndroid } from "react-native";
import RNFS from "react-native-fs"; // ✅ for file size
import { RootStackParamList } from "../../App";

type Project = {
  id: string;
  name: string;
  size: string;
  uri?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState("");

  const loadProjects = async () => {
    const raw = await AsyncStorage.getItem("projects");
    setProjects(
      raw
        ? JSON.parse(raw)
        : [{ id: "1", name: "Museb Project", size: "11.1 MB" }]
    );
  };

  const saveProjects = async (newProjects: Project[]) => {
    setProjects(newProjects);
    await AsyncStorage.setItem("projects", JSON.stringify(newProjects));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS !== "android") return true;
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        {
          title: "Media Permission",
          message: "App needs access to your videos to select a video",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to your storage to select videos",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  // Convert bytes to KB / MB / GB
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // Calculate total workspace size
  const totalWorkspaceSize = () => {
    let total = 0;
    projects.forEach((p) => {
      const num = parseFloat(p.size);
      if (!isNaN(num)) {
        if (p.size.includes("GB")) total += num * 1024 * 1024 * 1024;
        else if (p.size.includes("MB")) total += num * 1024 * 1024;
        else if (p.size.includes("KB")) total += num * 1024;
        else if (p.size.includes("B")) total += num;
      }
    });
    return formatFileSize(total);
  };

  const handleNewProject = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Cannot access gallery without permission");
      return;
    }

    const result = await launchImageLibrary({
      mediaType: "video",
      selectionLimit: 1,
    });

    if (!result.assets || !result.assets[0].uri) return;

    const uri = result.assets[0].uri;
    let fileSize: string = "Unknown";

    try {
      const stat = await RNFS.stat(uri.replace("file://", ""));
      fileSize = formatFileSize(Number(stat.size));
    } catch (error) {
      console.log("Error reading file size:", error);
    }

    const name = `Project ${projects.length + 1}`;
    const newProject: Project = {
      id: String(Date.now()),
      name,
      size: fileSize,
      uri,
    };

    saveProjects([...projects, newProject]);
  };

  const handleOptions = (item: Project) => {
    Alert.alert("Project Options", `Choose an action for "${item.name}"`, [
      {
        text: "Edit Name",
        onPress: () => {
          setEditingProject(item);
          setNewName(item.name);
        },
      },
      {
        text: "Delete",
        onPress: () => {
          const filtered = projects.filter((p) => p.id !== item.id);
          saveProjects(filtered);
        },
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const saveEditedName = () => {
    if (!editingProject) return;
    const updatedProjects = projects.map((p) =>
      p.id === editingProject.id ? { ...p, name: newName } : p
    );
    saveProjects(updatedProjects);
    setEditingProject(null);
    setNewName("");
  };

  const renderProjectItem = ({ item }: { item: Project }) => (
    <View style={styles.projectCard}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          item.uri && navigation.navigate("Video", { video: item.uri })
        }
      >
        <View style={styles.projectImage} />
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectSize}>{item.size}</Text>
      </TouchableOpacity>

      {/* 3-dot menu button */}
      <TouchableOpacity
        onPress={() => handleOptions(item)}
        style={styles.menuButton}
      >
        <Text style={{ fontSize: 22, color: "#aaa" }}>⋮</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.workspaceTitle}>Workspace</Text>
        <Text style={styles.projectCount}>
          {projects.length} Projects · {totalWorkspaceSize()}
        </Text>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProjectItem}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={styles.newProjectCard}
              onPress={handleNewProject}
            >
              <Text style={styles.newProjectCardIcon}>＋</Text>
              <Text style={styles.newProjectText}>New Project</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* Edit Project Name Modal */}
        <Modal visible={!!editingProject} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Project Name</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new name"
                placeholderTextColor="#999"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#555" }]}
                  onPress={() => setEditingProject(null)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#6c5ce7" }]}
                  onPress={saveEditedName}
                >
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1, padding: 20 },
  workspaceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
  },
  projectCount: { fontSize: 15, color: "#bbb", marginBottom: 20 },
  listContent: { paddingBottom: 40 },
  projectCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  projectImage: {
    height: 120,
    backgroundColor: "#6c5ce7",
    borderRadius: 12,
  },
  projectName: { color: "#fff", fontSize: 20, marginTop: 10, fontWeight: "600" },
  projectSize: { color: "#aaa", fontSize: 14, marginTop: 4 },
  newProjectCard: {
    marginTop: 20,
    height: 150,
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444",
    borderStyle: "dashed",
  },
  newProjectCardIcon: { fontSize: 42, color: "#666" },
  newProjectText: { marginTop: 10, color: "#aaa", fontSize: 16 },
  menuButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
