#define CUSTOM_SETTINGS
#define INCLUDE_GAMEPAD_MODULE
#include <Dabble.h>
const unsigned long BAUD_RATE = 9600;
int FRONT_ENA_value = 200; 
bool circlePressedPrev = false;
bool trianglePressedPrev = false;
//TODO:add LED indicators on car
// SET circle to accelerate, triangle to decelerate

#define MOTOR_FRONT_LEFT_FORWARD 6   
#define MOTOR_FRONT_LEFT_BACKWARD 7
#define MOTOR_FRONT_RIGHT_FORWARD 4  
#define MOTOR_FRONT_RIGHT_BACKWARD 5
#define MOTOR_REAR_LEFT_FORWARD 10  
#define MOTOR_REAR_LEFT_BACKWARD 11
#define MOTOR_REAR_RIGHT_FORWARD 8   
#define MOTOR_REAR_RIGHT_BACKWARD 9

#define FRONT_ENA 2
#define FRONT_ENB 3
#define REAR_ENA 12
#define REAR_ENB 13

void setup() {

  pinMode(MOTOR_FRONT_LEFT_FORWARD, OUTPUT);
  pinMode(MOTOR_FRONT_LEFT_BACKWARD, OUTPUT);
  pinMode(MOTOR_FRONT_RIGHT_FORWARD, OUTPUT);
  pinMode(MOTOR_FRONT_RIGHT_BACKWARD, OUTPUT);
  pinMode(MOTOR_REAR_LEFT_FORWARD, OUTPUT);
  pinMode(MOTOR_REAR_LEFT_BACKWARD, OUTPUT);
  pinMode(MOTOR_REAR_RIGHT_FORWARD, OUTPUT);
  pinMode(MOTOR_REAR_RIGHT_BACKWARD, OUTPUT);
  pinMode(FRONT_ENA, OUTPUT);
  pinMode(FRONT_ENB, OUTPUT);
  pinMode(REAR_ENA, OUTPUT);
  pinMode(REAR_ENB, OUTPUT);
  Serial.begin(BAUD_RATE);//usb
  Serial3.begin(BAUD_RATE); //Serial3 for communication with HM-10,RX 14 TX 15
  Dabble.begin(BAUD_RATE,14,15);
  Serial.println("setup complete");
  
}

void loop(){
  Dabble.processInput();
  
  analogWrite(FRONT_ENA, FRONT_ENA_value);//>70 to move and little buzzling
  analogWrite(FRONT_ENB, FRONT_ENA_value);//start speed: 100,ENA speed:70--255
  analogWrite(REAR_ENA, FRONT_ENA_value);
  analogWrite(REAR_ENB, FRONT_ENA_value);
  
  if (GamePad.isUpPressed())
  {
    moveForward();
    
  }

  else if (GamePad.isDownPressed())
  {
   moveBackward();
  }

  else if (GamePad.isLeftPressed())
  {
    turnLeft();
  }

  else if (GamePad.isRightPressed())
  {
    turnRight();
  }
  else
  {
    analogWrite(FRONT_ENA, 0);
    analogWrite(FRONT_ENB, 0);
    analogWrite(REAR_ENA, 0);
    analogWrite(REAR_ENB, 0);
    stopCar();
  }
if (GamePad.isCirclePressed() && !circlePressedPrev) {
    motorAccel(); 
    circlePressedPrev = true; 
  } else if (!GamePad.isCirclePressed()) {
    circlePressedPrev = false; 
  }

  if (GamePad.isTrianglePressed() && !trianglePressedPrev) {
    motorDecel(); 
    trianglePressedPrev = true;
  } else if (!GamePad.isTrianglePressed()) {
    trianglePressedPrev = false; 
  }

}
void motorAccel() {
  if (FRONT_ENA_value < 256) {
    FRONT_ENA_value += 10;
    updateMotorSpeed(); 
  }
}

void motorDecel() {
  if (FRONT_ENA_value < 256) {
    FRONT_ENA_value -= 10;
    updateMotorSpeed(); 
  }
}
void updateMotorSpeed() {
  
  analogWrite(FRONT_ENA, FRONT_ENA_value);
  analogWrite(FRONT_ENB, FRONT_ENA_value);
  analogWrite(REAR_ENA, FRONT_ENA_value);
  analogWrite(REAR_ENB, FRONT_ENA_value);
}

void moveForward() {
  digitalWrite(MOTOR_FRONT_LEFT_FORWARD, HIGH);
  digitalWrite(MOTOR_FRONT_LEFT_BACKWARD, LOW);
  digitalWrite(MOTOR_FRONT_RIGHT_FORWARD, HIGH);
  digitalWrite(MOTOR_FRONT_RIGHT_BACKWARD, LOW);
  digitalWrite(MOTOR_REAR_LEFT_FORWARD, HIGH);
  digitalWrite(MOTOR_REAR_LEFT_BACKWARD, LOW);
  digitalWrite(MOTOR_REAR_RIGHT_FORWARD, HIGH);
  digitalWrite(MOTOR_REAR_RIGHT_BACKWARD, LOW);
}
void moveBackward() {
  digitalWrite(MOTOR_FRONT_LEFT_FORWARD, LOW);
  digitalWrite(MOTOR_FRONT_LEFT_BACKWARD, HIGH);
  digitalWrite(MOTOR_FRONT_RIGHT_FORWARD, LOW);
  digitalWrite(MOTOR_FRONT_RIGHT_BACKWARD, HIGH);
  digitalWrite(MOTOR_REAR_LEFT_FORWARD, LOW);
  digitalWrite(MOTOR_REAR_LEFT_BACKWARD, HIGH);
  digitalWrite(MOTOR_REAR_RIGHT_FORWARD, LOW);
  digitalWrite(MOTOR_REAR_RIGHT_BACKWARD, HIGH);
}

void turnLeft() {
  digitalWrite(MOTOR_FRONT_LEFT_FORWARD, LOW);
  digitalWrite(MOTOR_FRONT_LEFT_BACKWARD, HIGH);
  digitalWrite(MOTOR_FRONT_RIGHT_FORWARD, HIGH);
  digitalWrite(MOTOR_FRONT_RIGHT_BACKWARD, LOW);
  digitalWrite(MOTOR_REAR_LEFT_FORWARD, LOW);
  digitalWrite(MOTOR_REAR_LEFT_BACKWARD, HIGH);
  digitalWrite(MOTOR_REAR_RIGHT_FORWARD, HIGH);
  digitalWrite(MOTOR_REAR_RIGHT_BACKWARD, LOW);
}


void turnRight() {
  digitalWrite(MOTOR_FRONT_LEFT_FORWARD, HIGH);
  digitalWrite(MOTOR_FRONT_LEFT_BACKWARD, LOW);
  digitalWrite(MOTOR_FRONT_RIGHT_FORWARD, LOW);
  digitalWrite(MOTOR_FRONT_RIGHT_BACKWARD, HIGH);
  digitalWrite(MOTOR_REAR_LEFT_FORWARD, HIGH);
  digitalWrite(MOTOR_REAR_LEFT_BACKWARD, LOW);
  digitalWrite(MOTOR_REAR_RIGHT_FORWARD, LOW);
  digitalWrite(MOTOR_REAR_RIGHT_BACKWARD, HIGH);
}

void stopCar() {
  digitalWrite(MOTOR_FRONT_LEFT_FORWARD, LOW);
  digitalWrite(MOTOR_FRONT_LEFT_BACKWARD, LOW);
  digitalWrite(MOTOR_FRONT_RIGHT_FORWARD, LOW);
  digitalWrite(MOTOR_FRONT_RIGHT_BACKWARD, LOW);
  digitalWrite(MOTOR_REAR_LEFT_FORWARD, LOW);
  digitalWrite(MOTOR_REAR_LEFT_BACKWARD, LOW);
  digitalWrite(MOTOR_REAR_RIGHT_FORWARD, LOW);
  digitalWrite(MOTOR_REAR_RIGHT_BACKWARD, LOW);
}
