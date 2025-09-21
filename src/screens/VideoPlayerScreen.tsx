// import React, { useRef, useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   Dimensions,
//   Animated,
//   ScrollView,
// } from "react-native";
// import Video from "react-native-video";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { Canvas, Path, Skia } from "@shopify/react-native-skia";
// import uuid from "react-native-uuid";
// import { RootStackParamList } from "../../App";

// type Props = NativeStackScreenProps<RootStackParamList, "Video">;
// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// interface Comment {
//   id: string;
//   time: number;
//   text: string;
//   x: number;
//   y: number;
// }

// interface Stroke {
//   color: string;
//   path: string;
//   time: number;
// }

// const COLORS = ["#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#000000","#ffffff"];

// const storageKeyFor = (videoUri: string) => `comments_video_${videoUri}`;
// const strokeKeyFor = (videoUri: string) => `strokes_video_${videoUri}`;

// const VideoScreen: React.FC<Props> = ({ route }) => {
//   const { video } = route.params;
//   const videoRef = useRef<Video | null>(null);
//   const [videoLoaded, setVideoLoaded] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [displayTime, setDisplayTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [input, setInput] = useState("");
//   const [replyTo, setReplyTo] = useState<Comment | null>(null);
//   const [strokes, setStrokes] = useState<Stroke[]>([]);
//   const [currentPath, setCurrentPath] = useState<any>(null);
//   const [drawing, setDrawing] = useState(false);
//   const [color, setColor] = useState(COLORS[0]);
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [activeCommentCard, setActiveCommentCard] = useState<Comment | null>(null);
//   const currentTimeRef = useRef<number>(0);
//   const lastUpdateRef = useRef<number>(0);
//   const activePathRef = useRef<any>(null);
//   const cardOpacity = useRef(new Animated.Value(0)).current;

//   const KEY = storageKeyFor(video);
//   const STROKE_KEY = strokeKeyFor(video);

//   // Load comments and strokes
//   const loadComments = useCallback(async () => {
//     const raw = await AsyncStorage.getItem(KEY);
//     setComments(raw ? JSON.parse(raw) : []);
//   }, [KEY]);

//   const loadStrokes = useCallback(async () => {
//     const raw = await AsyncStorage.getItem(STROKE_KEY);
//     setStrokes(raw ? JSON.parse(raw) : []);
//   }, [STROKE_KEY]);

//   useEffect(() => { loadComments(); loadStrokes(); }, [loadComments, loadStrokes]);

//   const saveComments = async (newComments: Comment[]) => {
//     await AsyncStorage.setItem(KEY, JSON.stringify(newComments));
//     setComments(newComments);
//   };

//   const saveStrokes = async (newStrokes: Stroke[]) => {
//     await AsyncStorage.setItem(STROKE_KEY, JSON.stringify(newStrokes));
//     setStrokes(newStrokes);
//   };

//   const addComment = async (text: string, x: number, y: number) => {
//     const newComment: Comment = { id: String(uuid.v4()), time: currentTimeRef.current, text, x, y };
//     saveComments([...comments, newComment]);
//   };

//   const handleAddCommentButton = () => {
//     if (!videoLoaded) return;
//     setPaused(true);
//     setReplyTo({ id: "center", time: currentTimeRef.current, text: "", x: 0.5, y: 0.5 });
//   };

//   const handleVideoPress = (e: any) => {
//     if (!videoLoaded || drawing) return;
//     const { locationX, locationY } = e.nativeEvent;
//     const x = locationX / SCREEN_WIDTH;
//     const y = locationY / 220;
//     setReplyTo({ id: "tap", time: currentTimeRef.current, text: "", x, y });
//     setPaused(true);
//   };

//   const confirmComment = async () => {
//     if (replyTo && input.trim()) {
//       await addComment(input.trim(), replyTo.x, replyTo.y);
//     }
//     setInput(""); setReplyTo(null);
//     setPaused(false); // Resume video
//   };

//   const togglePlay = () => { if(videoLoaded) setPaused(p => !p); };

//   const toggleDrawing = () => {
//     if (!videoLoaded) return;
//     setDrawing(d => !d);
//     setShowColorPicker(d => !d);
//     if (!drawing) setPaused(true);
//   };

//   const handleProgress = (data: { currentTime: number }) => {
//     currentTimeRef.current = data.currentTime;
//     const now = Date.now();
//     if (now - lastUpdateRef.current > 200) {
//       lastUpdateRef.current = now;
//       setDisplayTime(data.currentTime);
//     }
//   };

//   const handleLoad = (meta: { duration: number }) => {
//     setVideoLoaded(true);
//     setDuration(meta.duration);
//     setTimeout(() => videoRef.current?.seek(0.01), 100);
//   };

//   // Pencil handlers
//   const handleTouchStart = (e: any) => {
//     if (!drawing) return;
//     const path = Skia.Path.Make();
//     const { locationX, locationY } = e.nativeEvent;
//     path.moveTo(locationX, locationY);
//     activePathRef.current = path;
//     setCurrentPath(path.copy());
//   };

//   const handleTouchMove = (e: any) => {
//     if (!drawing || !activePathRef.current) return;
//     const { locationX, locationY } = e.nativeEvent;
//     activePathRef.current.lineTo(locationX, locationY);
//     setCurrentPath(activePathRef.current.copy());
//   };

//   const handleTouchEnd = () => {
//     if (!activePathRef.current) return;
//     const finalPath = activePathRef.current.toSVGString();
//     const updated = [...strokes, { color, path: finalPath, time: currentTimeRef.current }];
//     saveStrokes(updated);
//     activePathRef.current = null;
//     setCurrentPath(null);

//     // Stop drawing but do NOT auto-play
//     setDrawing(false);
//     setShowColorPicker(false);
//   };

//   const handleBubblePress = (c: Comment) => {
//     setActiveCommentCard(c);
//     Animated.sequence([
//       Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
//       Animated.delay(2000),
//       Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
//     ]).start();
//   };

//   const seekForward = () => { if(videoLoaded) videoRef.current?.seek(currentTimeRef.current + 10); };
//   const seekBackward = () => { if(videoLoaded) videoRef.current?.seek(currentTimeRef.current - 10); };

//   const videoSource = video.startsWith("http") ? { uri: video } : { uri: `file://${video}` };

//   return (
//     <View style={styles.container}>
//       <View style={styles.videoWrapper}>
//         <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleVideoPress}>
//           <Video
//             ref={videoRef}
//             source={videoSource}
//             style={styles.video}
//             paused={paused}
//             onLoad={handleLoad}
//             onProgress={handleProgress}
//             resizeMode="contain"
//             controls={false}
//             onError={(e) => console.log("Video error:", e)}
//           />
//         </TouchableOpacity>

//         {/* Canvas always rendered */}
//         <Canvas
//           style={StyleSheet.absoluteFill}
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//           onTouchEnd={handleTouchEnd}
//         >
//           {strokes
//             .filter(s => Math.abs(s.time - currentTimeRef.current) < 0.5)
//             .map((stroke, idx) => (
//               <Path
//                 key={idx}
//                 path={Skia.Path.MakeFromSVGString(stroke.path)!}
//                 color={stroke.color}
//                 style="stroke"
//                 strokeWidth={3}
//               />
//             ))}
//           {drawing && currentPath && (
//             <Path path={currentPath} color={color} style="stroke" strokeWidth={3} />
//           )}
//         </Canvas>

//         {/* Comments bubbles */}
//         {comments.filter(c => Math.abs(c.time - currentTimeRef.current) < 0.5).map(c => (
//           <TouchableOpacity
//             key={c.id}
//             style={[styles.bubble, { left: c.x * SCREEN_WIDTH - 12, top: c.y * 220 - 12 }]}
//             onPress={() => handleBubblePress(c)}
//           >
//             <Text>💬</Text>
//           </TouchableOpacity>
//         ))}

//         {/* Active comment card */}
//         {activeCommentCard && (
//           <Animated.View
//             style={[styles.activeCard, { top: activeCommentCard.y * 220 + 30, left: activeCommentCard.x * SCREEN_WIDTH, opacity: cardOpacity }]}
//           >
//             <Text>{activeCommentCard.text}</Text>
//           </Animated.View>
//         )}

//         {/* Color picker */}
//         {showColorPicker && (
//           <View style={styles.colorPicker}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               {COLORS.map((c) => (
//                 <TouchableOpacity
//                   key={c}
//                   style={[styles.colorCircle, { backgroundColor: c, borderWidth: color === c ? 2 : 0 }]}
//                   onPress={() => { setColor(c); setShowColorPicker(false); }}
//                 />
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </View>

//       {/* Controls */}
//       <View style={styles.controls}>
//         <TouchableOpacity onPress={seekBackward} style={styles.controlBtn}><Text>⏪ 10s</Text></TouchableOpacity>
//         <TouchableOpacity onPress={togglePlay} style={styles.controlBtn}><Text>{paused ? "▶️" : "⏸️"}</Text></TouchableOpacity>
//         <TouchableOpacity onPress={seekForward} style={styles.controlBtn}><Text>10s ⏩</Text></TouchableOpacity>
//         <TouchableOpacity onPress={handleAddCommentButton} style={styles.controlBtn}><Text>💬 Add</Text></TouchableOpacity>
//         <TouchableOpacity onPress={toggleDrawing} style={styles.controlBtn}><Text>✏️</Text></TouchableOpacity>
//       </View>

//       {/* Video Timer */}
//       <Text style={styles.timer}>{displayTime.toFixed(1)} / {duration.toFixed(1)}s</Text>

//       {replyTo && (
//         <View style={styles.inputRow}>
//           <TextInput value={input} onChangeText={setInput} placeholder="Add a comment" style={styles.input} />
//           <TouchableOpacity onPress={confirmComment} style={styles.addBtn}><Text style={{ color: "white" }}>Save</Text></TouchableOpacity>
//         </View>
//       )}

//       {/* Replay Section */}
//       <Text style={styles.sectionTitle}>Replay Commands</Text>
//       <FlatList
//         data={comments}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity style={styles.commandItem} onPress={() => videoRef.current?.seek(item.time)}>
//             <Text>{item.text} ({item.time.toFixed(1)}s)</Text>
//           </TouchableOpacity>
//         )}
//         ListEmptyComponent={<Text style={styles.empty}>No commands yet</Text>}
//         style={{ maxHeight: 150 }}
//       />
//     </View>
//   );
// };

// export default VideoScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fefefe", padding: 10 },
//   videoWrapper: { width: "100%", height: 220, backgroundColor: "black" },
//   video: { width: "100%", height: "100%" },
//   controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginVertical: 10 },
//   controlBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 5, minWidth: 50, alignItems: "center" },
//   inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginRight: 5 },
//   addBtn: { backgroundColor: "#007bff", padding: 10, borderRadius: 5 },
//   bubble: { position: "absolute", width: 24, height: 24, justifyContent: "center", alignItems: "center", backgroundColor: "yellow", borderRadius: 12 },
//   sectionTitle: { fontWeight: "600", marginTop: 10, marginBottom: 5, fontSize: 16 },
//   commandItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc", backgroundColor: "#fafafa" },
//   empty: { textAlign: "center", marginTop: 20, fontStyle: "italic" },
//   activeCard: { position: "absolute", backgroundColor: "#00000099", padding: 5, borderRadius: 5 },
//   colorPicker: { position: "absolute", bottom: 50, left: 10, right: 10, padding: 5, backgroundColor: "#ffffffdd", borderRadius: 8 },
//   colorCircle: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5 },
//   timer: { textAlign: "center", fontWeight: "600", marginVertical: 5, fontSize: 14 },
// });


import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import Video from "react-native-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import uuid from "react-native-uuid";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Video">;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Comment {
  id: string;
  time: number;
  text: string;
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  path: string;
  time: number;
}

const COLORS = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#000000",
  "#ffffff",
];

const storageKeyFor = (videoUri: string) => `comments_video_${videoUri}`;
const strokeKeyFor = (videoUri: string) => `strokes_video_${videoUri}`;

const VideoScreen: React.FC<Props> = ({ route }) => {
  const { video } = route.params || { video: "" };
  const videoRef = useRef<Video | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeCommentCard, setActiveCommentCard] = useState<Comment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState<number>(0); // to remount Video on error

  const currentTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const activePathRef = useRef<any>(null);
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeJSONParse = (raw: string | null) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to parse JSON from storage:", err);
      return null;
    }
  };

  const KEY = storageKeyFor(video || "default_video");
  const STROKE_KEY = strokeKeyFor(video || "default_video");

  // Load comments and strokes safely
  const loadComments = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const parsed = safeJSONParse(raw);
      if (mountedRef.current) setComments(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.warn("loadComments error:", err);
      if (mountedRef.current) setComments([]);
    }
  }, [KEY]);

  const loadStrokes = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STROKE_KEY);
      const parsed = safeJSONParse(raw);
      if (mountedRef.current) setStrokes(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.warn("loadStrokes error:", err);
      if (mountedRef.current) setStrokes([]);
    }
  }, [STROKE_KEY]);

  useEffect(() => {
    loadComments();
    loadStrokes();
  }, [loadComments, loadStrokes]);

  const saveComments = async (newComments: Comment[]) => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(newComments));
      if (mountedRef.current) setComments(newComments);
    } catch (err) {
      console.warn("saveComments error:", err);
    }
  };

  const saveStrokes = async (newStrokes: Stroke[]) => {
    try {
      await AsyncStorage.setItem(STROKE_KEY, JSON.stringify(newStrokes));
      if (mountedRef.current) setStrokes(newStrokes);
    } catch (err) {
      console.warn("saveStrokes error:", err);
    }
  };

  const addComment = async (text: string, x: number, y: number) => {
    const newComment: Comment = { id: String(uuid.v4()), time: currentTimeRef.current, text, x, y };
    await saveComments([...comments, newComment]);
  };

  const handleAddCommentButton = () => {
    if (!videoLoaded) return;
    setPaused(true);
    setReplyTo({ id: "center", time: currentTimeRef.current, text: "", x: 0.5, y: 0.5 });
  };

  const handleVideoPress = (e: any) => {
    if (!videoLoaded || drawing) return;
    const { locationX, locationY } = e.nativeEvent;
    const x = Math.max(0, Math.min(1, locationX / SCREEN_WIDTH));
    const y = Math.max(0, Math.min(1, locationY / 220));
    setReplyTo({ id: "tap", time: currentTimeRef.current, text: "", x, y });
    setPaused(true);
  };

  const confirmComment = async () => {
    if (replyTo && input.trim()) {
      await addComment(input.trim(), replyTo.x, replyTo.y);
    }
    setInput("");
    setReplyTo(null);
    setPaused(false); // Resume video
  };

  const togglePlay = () => {
    if (videoLoaded) setPaused((p) => !p);
  };

  const toggleDrawing = () => {
    if (!videoLoaded) return;
    // toggle drawing; if starting drawing, pause video
    setDrawing((d) => {
      const next = !d;
      if (next) setPaused(true);
      return next;
    });
    setShowColorPicker((prev) => !prev);
  };

  const handleProgress = (data: { currentTime: number }) => {
    currentTimeRef.current = data.currentTime;
    const now = Date.now();
    if (now - lastUpdateRef.current > 200) {
      lastUpdateRef.current = now;
      if (mountedRef.current) setDisplayTime(data.currentTime);
    }
  };

  const handleLoad = (meta: { duration: number }) => {
    try {
      setVideoLoaded(true);
      setDuration(meta.duration || 0);
      // safe initial seek after load
      setTimeout(() => {
        try {
          if (videoRef.current && typeof videoRef.current.seek === "function") {
            videoRef.current.seek(0.01);
          }
        } catch (err) {
          console.warn("safe seek failed:", err);
        }
      }, 100);
    } catch (err) {
      console.warn("handleLoad error:", err);
    }
  };

  // Video error handler — prevents crash, attempts graceful remount
  const handleVideoError = (err: any) => {
    console.warn("Video error:", err);
    setErrorMessage("There was a problem loading this video. Retrying...");
    // Remount the Video component to recover from transient parsing/codec errors
    setTimeout(() => {
      // clear error and remount
      if (mountedRef.current) {
        setErrorMessage(null);
        setVideoLoaded(false);
        setVideoKey((k) => k + 1);
      }
    }, 800); // short delay before remount to avoid tight loop
  };

  // Helpers for paths: make safe Skia path from SVG string
  const makeSafeSkiaPath = (svg: string) => {
    try {
      if (!svg) return null;
      return Skia.Path.MakeFromSVGString(svg) || null;
    } catch (err) {
      console.warn("Invalid SVG path for Skia:", err);
      return null;
    }
  };

  // Pencil handlers
  const handleTouchStart = (e: any) => {
    if (!drawing) return;
    try {
      const path = Skia.Path.Make();
      const { locationX, locationY } = e.nativeEvent;
      path.moveTo(locationX, locationY);
      activePathRef.current = path;
      setCurrentPath(path.copy());
    } catch (err) {
      console.warn("handleTouchStart error:", err);
    }
  };

  const handleTouchMove = (e: any) => {
    if (!drawing || !activePathRef.current) return;
    try {
      const { locationX, locationY } = e.nativeEvent;
      activePathRef.current.lineTo(locationX, locationY);
      setCurrentPath(activePathRef.current.copy());
    } catch (err) {
      console.warn("handleTouchMove error:", err);
    }
  };

  const handleTouchEnd = () => {
    if (!activePathRef.current) return;
    try {
      const finalPath = activePathRef.current.toSVGString();
      const updated = [...strokes, { color, path: finalPath, time: currentTimeRef.current }];
      saveStrokes(updated);
    } catch (err) {
      console.warn("handleTouchEnd error:", err);
    } finally {
      activePathRef.current = null;
      setCurrentPath(null);
      setDrawing(false);
      setShowColorPicker(false);
    }
  };

  const handleBubblePress = (c: Comment) => {
    setActiveCommentCard(c);
    Animated.sequence([
      Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const seekForward = () => {
    if (videoLoaded && videoRef.current && typeof videoRef.current.seek === "function") {
      videoRef.current.seek(currentTimeRef.current + 10);
    }
  };

  const seekBackward = () => {
    if (videoLoaded && videoRef.current && typeof videoRef.current.seek === "function") {
      videoRef.current.seek(Math.max(0, currentTimeRef.current - 10));
    }
  };

  // Normalize video URI — handle local file paths and ensure encoding
  const normalizeVideoUri = (raw: string) => {
    if (!raw) return "";
    let normalized = raw;
    // If it's a local absolute path (starts with /), prefix file://
    if (raw.startsWith("/")) {
      normalized = `file://${raw}`;
    }
    // If it already starts with file:// or http(s) keep it
    if (!/^https?:\/\//i.test(normalized) && !/^file:\/\//i.test(normalized)) {
      // try to encode
      try {
        normalized = encodeURI(normalized);
      } catch (err) {
        console.warn("encodeURI failed:", err);
      }
    } else {
      try {
        normalized = encodeURI(normalized);
      } catch (err) {
        // keep original
      }
    }
    return normalized;
  };

  const videoUri = normalizeVideoUri(video);

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        {/* show non-fatal error message as overlay */}
        {errorMessage && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Touchable covers video to capture taps for comments */}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleVideoPress} activeOpacity={1}>
          <Video
            key={`video-${videoKey}`}
            ref={videoRef}
            source={videoUri ? { uri: videoUri } : undefined}
            style={styles.video}
            paused={paused}
            onLoad={handleLoad}
            onProgress={handleProgress}
            resizeMode="contain"
            controls={false}
            onError={handleVideoError}
          />
        </TouchableOpacity>

        {/* Canvas always rendered so strokes overlay the video */}
        <Canvas
          style={StyleSheet.absoluteFill}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {strokes
            .filter((s) => Math.abs(s.time - currentTimeRef.current) < 0.5)
            .map((stroke, idx) => {
              const skPath = makeSafeSkiaPath(stroke.path);
              if (!skPath) return null;
              return (
                <Path
                  key={`${stroke.time}-${idx}`}
                  path={skPath}
                  color={stroke.color}
                  style="stroke"
                  strokeWidth={3}
                />
              );
            })}
          {drawing && currentPath && <Path path={currentPath} color={color} style="stroke" strokeWidth={3} />}
        </Canvas>

        {/* Comments bubbles (anchored positions) */}
        {comments
          .filter((c) => Math.abs(c.time - currentTimeRef.current) < 0.5)
          .map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.bubble, { left: c.x * SCREEN_WIDTH - 12, top: c.y * 220 - 12 }]}
              onPress={() => handleBubblePress(c)}
            >
              <Text>💬</Text>
            </TouchableOpacity>
          ))}

        {/* Active comment card */}
        {activeCommentCard && (
          <Animated.View
            style={[
              styles.activeCard,
              {
                top: activeCommentCard.y * 220 + 30,
                left: Math.min(SCREEN_WIDTH - 120, Math.max(0, activeCommentCard.x * SCREEN_WIDTH)),
                opacity: cardOpacity,
              },
            ]}
          >
            <Text style={{ color: "#fff" }}>{activeCommentCard.text}</Text>
          </Animated.View>
        )}

        {/* Color picker */}
        {showColorPicker && (
          <View style={styles.colorPicker}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorCircle, { backgroundColor: c, borderWidth: color === c ? 2 : 0 }]}
                  onPress={() => {
                    setColor(c);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={seekBackward} style={styles.controlBtn}>
          <Text>⏪ 10s</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={styles.controlBtn}>
          <Text>{paused ? "▶️" : "⏸️"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={seekForward} style={styles.controlBtn}>
          <Text>10s ⏩</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddCommentButton} style={styles.controlBtn}>
          <Text>💬 Add</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleDrawing} style={styles.controlBtn}>
          <Text>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Video Timer */}
      <Text style={styles.timer}>
        {displayTime.toFixed(1)} / {duration.toFixed(1)}s
      </Text>

      {replyTo && (
        <View style={styles.inputRow}>
          <TextInput value={input} onChangeText={setInput} placeholder="Add a comment" style={styles.input} />
          <TouchableOpacity
            onPress={async () => {
              try {
                await confirmComment();
              } catch (err) {
                console.warn("confirmComment error:", err);
                Alert.alert("Error", "Could not save comment.");
              }
            }}
            style={styles.addBtn}
          >
            <Text style={{ color: "white" }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Replay Section */}
      <Text style={styles.sectionTitle}>Replay Commands</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.commandItem}
            onPress={() => {
              try {
                if (videoRef.current && typeof videoRef.current.seek === "function") {
                  videoRef.current.seek(item.time);
                }
              } catch (err) {
                console.warn("seek error:", err);
              }
            }}
          >
            <Text>
              {item.text} ({item.time.toFixed(1)}s)
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No commands yet</Text>}
        style={{ maxHeight: 150 }}
      />
    </View>
  );
};

export default VideoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fefefe", padding: 10 },
  videoWrapper: { width: "100%", height: 220, backgroundColor: "black" },
  video: { width: "100%", height: "100%" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginVertical: 10 },
  controlBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 5, minWidth: 50, alignItems: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginRight: 5 },
  addBtn: { backgroundColor: "#007bff", padding: 10, borderRadius: 5 },
  bubble: { position: "absolute", width: 24, height: 24, justifyContent: "center", alignItems: "center", backgroundColor: "yellow", borderRadius: 12 },
  sectionTitle: { fontWeight: "600", marginTop: 10, marginBottom: 5, fontSize: 16 },
  commandItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc", backgroundColor: "#fafafa" },
  empty: { textAlign: "center", marginTop: 20, fontStyle: "italic" },
  activeCard: { position: "absolute", backgroundColor: "#00000099", padding: 8, borderRadius: 6, maxWidth: 200 },
  colorPicker: { position: "absolute", bottom: 50, left: 10, right: 10, padding: 5, backgroundColor: "#ffffffdd", borderRadius: 8 },
  colorCircle: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5 },
  timer: { textAlign: "center", fontWeight: "600", marginVertical: 5, fontSize: 14 },
  errorOverlay: { position: "absolute", top: 0, left: 0, right: 0, padding: 8, backgroundColor: "#ff3333cc", zIndex: 50 },
  errorText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
