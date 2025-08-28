import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(static_image_mode=False, 
                    min_detection_confidence=0.5, 
                    min_tracking_confidence=0.5)

# ---------- Helper Functions ----------
def analyze_video(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return None

    head_positions = []
    front_foot_positions = []
    back_foot_positions = []

    window_name = f"Analyzing {video_path}"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 360, 640)


    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        annotated_frame = frame.copy()

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                annotated_frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS
            )

            landmarks = results.pose_landmarks.landmark

            # Get normalized coordinates (y position)
            head_y = landmarks[mp_pose.PoseLandmark.NOSE].y
            front_foot_y = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y
            back_foot_y = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].y

            head_positions.append(head_y)
            front_foot_positions.append(front_foot_y)
            back_foot_positions.append(back_foot_y)

        cv2.imshow(f"Analyzing {video_path}", annotated_frame)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return calculate_score(head_positions, front_foot_positions, back_foot_positions)


def calculate_score(head, front, back):
    if not head or not front or not back:
        return 0

    score = 0

    # Head stability (less movement = better)
    head_movement = max(head) - min(head)
    if head_movement < 0.05:
        score += 40
    elif head_movement < 0.1:
        score += 30
    else:
        score += 10

    # Front foot stride (more forward movement = better)
    foot_stride = max(front) - min(front)
    if foot_stride > 0.1:
        score += 40
    elif foot_stride > 0.05:
        score += 25
    else:
        score += 10

    # Back foot stability (less movement = better)
    back_movement = max(back) - min(back)
    if back_movement < 0.05:
        score += 20
    elif back_movement < 0.1:
        score += 10
    else:
        score += 5

    return score

# ---------- Main Execution ----------
video1 = "cover_drive1.mp4"  # First shot
video2 = "cover_drive2.mp4"  # Second shot

print("Analyzing first video...")
score1 = analyze_video(video1)
print(f"Video 1 Score: {score1}/100")

print("\nAnalyzing second video...")
score2 = analyze_video(video2)
print(f"Video 2 Score: {score2}/100")

print("\n--- Final Comparison ---")
if score1 > score2:
    print(f"🏆 Video 1 is better by {score1 - score2} points!")
elif score2 > score1:
    print(f"🏆 Video 2 is better by {score2 - score1} points!")
else:
    print("🤝 Both shots are equally good!")
