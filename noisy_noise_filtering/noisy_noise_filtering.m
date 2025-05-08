clear;
close all;
clc;

%% Signal Generation
fs = 1000;               % Sampling frequency (Hz)
t_duration = 10;        
dt = 1/fs;               % Time step
t = 0:dt:t_duration-dt;  
f_signal = 0.3;          % Signal frequency (Hz)
noise_std = 2;           

% Generate original signal with noise
pure_signal = 0.5 * sin(2*pi*f_signal*t);
noise = noise_std * randn(size(t));  % Zero mean, std = 2
noisy_signal = pure_signal + noise;

%% Analog Filter Design
% Design analog Butterworth low-pass filters with different cutoffs
Wn1 = 2*pi*1;           % 1 Hz cutoff in rad/sec
Wn2 = 2*pi*10;          % 10 Hz 
Wn3 = 2*pi*100;         % 100 Hz 

% Create analog filters (2nd order)
[b1, a1] = butter(2, Wn1, 's');  
[b2, a2] = butter(2, Wn2, 's');
[b3, a3] = butter(2, Wn3, 's');

% Create transfer function systems
sys1 = tf(b1, a1);
sys2 = tf(b2, a2);
sys3 = tf(b3, a3);

% Filter signals
filtered_1Hz = lsim(sys1, noisy_signal, t);
filtered_10Hz = lsim(sys2, noisy_signal, t);
filtered_100Hz = lsim(sys3, noisy_signal, t);

%% Time Domain Plots
figure('Position', [100, 100, 800, 600]);

subplot(4,1,1);
plot(t, noisy_signal);
title('Original Noisy Signal');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;
ylim([-10 10]);

subplot(4,1,2);
plot(t, filtered_1Hz);
title('1 Hz Low-Pass Filtered Signal');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;
ylim([-2 2]);

subplot(4,1,3);
plot(t, filtered_10Hz);
title('10 Hz Low-Pass Filtered Signal');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;
ylim([-5 5]);

subplot(4,1,4);
plot(t, filtered_100Hz);
title('100 Hz Low-Pass Filtered Signal');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;
ylim([-10 10]);

%% Frequency Domain Analysis
% Compute frequency content using FFT
L = length(t);
f = fs*(0:(L/2))/L;  % Frequency vector for plotting

% Original signal FFT
Y = fft(noisy_signal);
P2 = abs(Y/L);
P1 = P2(1:L/2+1);
P1(2:end-1) = 2*P1(2:end-1);

% 1 Hz filter FFT
Y1 = fft(filtered_1Hz);
P2_1 = abs(Y1/L);
P1_1 = P2_1(1:L/2+1);
P1_1(2:end-1) = 2*P1_1(2:end-1);

% 10 Hz filter FFT
Y2 = fft(filtered_10Hz);
P2_2 = abs(Y2/L);
P1_2 = P2_2(1:L/2+1);
P1_2(2:end-1) = 2*P1_2(2:end-1);

% 100 Hz filter FFT
Y3 = fft(filtered_100Hz);
P2_3 = abs(Y3/L);
P1_3 = P2_3(1:L/2+1);
P1_3(2:end-1) = 2*P1_3(2:end-1);

% Plot frequency content
figure('Position', [100, 100, 800, 600]);

subplot(4,1,1);
plot(f, P1);
title('Frequency Content of Original Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

subplot(4,1,2);
plot(f, P1_1);
title('Frequency Content of 1 Hz Filtered Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

subplot(4,1,3);
plot(f, P1_2);
title('Frequency Content of 10 Hz Filtered Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

subplot(4,1,4);
plot(f, P1_3);
title('Frequency Content of 100 Hz Filtered Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

%% Additional Analysis - Filter Frequency Response
figure('Position', [100, 100, 800, 400]);

% Frequency vector for filter response (0 to 150 Hz)
w = linspace(0, 2*pi*150, 1000);

% Get frequency response
[mag1, phase1] = bode(sys1, w);
[mag2, phase2] = bode(sys2, w);
[mag3, phase3] = bode(sys3, w);

% Convert rad/s to Hz for plotting
f_resp = w/(2*pi);

% Plot magnitude response
subplot(1,1,1);
semilogx(f_resp, 20*log10(squeeze(mag1)), 'LineWidth', 2);
hold on;
semilogx(f_resp, 20*log10(squeeze(mag2)), 'LineWidth', 2);
semilogx(f_resp, 20*log10(squeeze(mag3)), 'LineWidth', 2);
hold off;

title('Analog Filter Magnitude Response');
xlabel('Frequency (Hz)');
ylabel('Magnitude (dB)');
grid on;
legend('1 Hz', '10 Hz', '100 Hz');
xlim([0.1 150]);

%% Digital Filter
clear;

dt = 0.001;                   % Sampling time (1 ms)
fs = 1/dt;                    % Sampling frequency (1 kHz)
t_duration = 1;               % Signal duration (s)
N = 0:dt:t_duration-dt;       % Sample index vector
t = N;                        % Time vector

% Generate input signal: 2.5*sin(2*pi*5*N*dt) + 10*sin(2*pi*100*N*dt) + n(N*dt)
signal_5Hz = 2.5 * sin(2*pi*5*N);
signal_100Hz = 10 * sin(2*pi*100*N);
noise = 2 * randn(size(N));   % Zero mean, std = 2
x = signal_5Hz + signal_100Hz + noise;

% Design digital filters with 10 Hz passband
% 1st order Butterworth
[b_butter1, a_butter1] = butter(1, 10/(fs/2));

% 2nd order Butterworth 
[b_butter2, a_butter2] = butter(2, 10/(fs/2));

% 2nd order Chebyshev (with 1 dB passband ripple)
[b_cheby, a_cheby] = cheby1(2, 1, 10/(fs/2));

% Apply digital filters using filter function
y_butter1 = filter(b_butter1, a_butter1, x);
y_butter2 = filter(b_butter2, a_butter2, x);
y_cheby = filter(b_cheby, a_cheby, x);

% Time domain plots
figure;
subplot(4,1,1);
plot(t, x);
title('Original Signal');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;

subplot(4,1,2);
plot(t, y_butter1);
title('1st Order Butterworth (10 Hz)');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;

subplot(4,1,3);
plot(t, y_butter2);
title('2nd Order Butterworth (10 Hz)');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;

subplot(4,1,4);
plot(t, y_cheby);
title('2nd Order Chebyshev (10 Hz)');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;


%% Compute frequency content using FFT
L = length(t);
f = fs*(0:(L/2))/L;  % Frequency vector for plotting

% Original signal FFT
Y = fft(x);
P2 = abs(Y/L);
P1 = P2(1:L/2+1);
P1(2:end-1) = 2*P1(2:end-1);

% 1st order Butterworth FFT
Y_b1 = fft(y_butter1);
P2_b1 = abs(Y_b1/L);
P1_b1 = P2_b1(1:L/2+1);
P1_b1(2:end-1) = 2*P1_b1(2:end-1);

% 2nd order Butterworth FFT
Y_b2 = fft(y_butter2);
P2_b2 = abs(Y_b2/L);
P1_b2 = P2_b2(1:L/2+1);
P1_b2(2:end-1) = 2*P1_b2(2:end-1);

% 2nd order Chebyshev FFT
Y_c = fft(y_cheby);
P2_c = abs(Y_c/L);
P1_c = P2_c(1:L/2+1);
P1_c(2:end-1) = 2*P1_c(2:end-1);

% Plot frequency content
figure;
subplot(4,1,1);
plot(f, P1);
title('Frequency Content of Original Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

subplot(4,1,2);
plot(f, P1_b1);
title('Frequency Content of 1st Order Butterworth Filtered Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

subplot(4,1,3);
plot(f, P1_b2);
title('Frequency Content of 2nd Order Butterworth Filtered Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;

subplot(4,1,4);
plot(f, P1_c);
title('Frequency Content of 2nd Order Chebyshev Filtered Signal');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');
xlim([0 150]);
grid on;



%% Plot filter frequency response
figure;
[h1, w1] = freqz(b_butter1, a_butter1, 1024, fs);
[h2, w2] = freqz(b_butter2, a_butter2, 1024, fs);
[h3, w3] = freqz(b_cheby, a_cheby, 1024, fs);

subplot(2,1,1);
plot(w1, abs(h1), 'b', w2, abs(h2), 'r', w3, abs(h3), 'g');
title('Filter Magnitude Response');
xlabel('Frequency (Hz)');
ylabel('Magnitude');
legend('1st Order Butterworth', '2nd Order Butterworth', '2nd Order Chebyshev');
grid on;

subplot(2,1,2);
plot(w1, angle(h1), 'b', w2, angle(h2), 'r', w3, angle(h3), 'g');
title('Filter Phase Response');
xlabel('Frequency (Hz)');
ylabel('Phase (radians)');
legend('1st Order Butterworth', '2nd Order Butterworth', '2nd Order Chebyshev');
grid on;
