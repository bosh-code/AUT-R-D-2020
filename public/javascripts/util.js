import { instructor } from "./instructor.js";

let isInstructor = true;
let colour = "aqua";
const boundingBoxColor = "red";
const lineWidth = 3;

function setColour(c) {
  colour = c;
}

function calculateSlope([ay, ax], [by, bx]) {
  return (ay - by) / (bx - ax);
}

function calculateAngle(m1, m2) {
  // console.log(m1, m2);
  const tan = Math.abs((m2 - m1) / (1 + m1 * m2));
  const radians = Math.atan(tan);
  const angle = (radians * 180) / Math.PI;
  return angle;
}

function toTuple({ y, x }) {
  return [y, x];
}

export function toggleInstructor(t) {
  isInstructor = t;
}

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  //   console.log("adjacent", adjacentKeyPoints);
  //   console.log("keypoint", keypoints);

  adjacentKeyPoints.forEach((keypoints) => {
    if (isInstructor) {
      setColour("LightGreen");
    } else {
      const key1 = `${keypoints[0].part}_${keypoints[1].part}`;
      const key2 = `${keypoints[1].part}_${keypoints[0].part}`;
      const instructorSlope =
        instructor[0].slope[key1] || instructor[0].slope[key2];
      const studentSlope = calculateSlope(
        toTuple(keypoints[0].position),
        toTuple(keypoints[1].position)
      );

      const angle = Math.floor(calculateAngle(instructorSlope, studentSlope));
      // console.log(key1, angle);

      if (angle > 8) {
        setColour("OrangeRed");
      } else {
        setColour("Yellow");
      }
    }

    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      colour,
      scale,
      ctx
    );
  });
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (
      keypoint.score < minConfidence ||
      keypoint.part === "nose" ||
      keypoint.part === "leftEye" ||
      keypoint.part === "rightEye" ||
      keypoint.part === "leftEar" ||
      keypoint.part === "rightEar"
    ) {
      continue;
    }

    if (isInstructor) {
      setColour("MediumSeaGreen");
    } else {
      setColour("DarkCyan");
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 6, colour);
  }
}

/**
 * Draw the bounding box of a pose. For example, for a whole person standing
 * in an image, the bounding box will begin at the nose and extend to one of
 * ankles
 */
export function drawBoundingBox(keypoints, ctx) {
  const boundingBox = posenet.getBoundingBox(keypoints);

  ctx.rect(
    boundingBox.minX,
    boundingBox.minY,
    boundingBox.maxX - boundingBox.minX,
    boundingBox.maxY - boundingBox.minY
  );

  ctx.strokeStyle = boundingBoxColor;
  ctx.stroke();
}

/**
 * Draw an image on a canvas
 */
export function renderImageToCanvas(image, size, canvas) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0, size[0], size[1]);
}
