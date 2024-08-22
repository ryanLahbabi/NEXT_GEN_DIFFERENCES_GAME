import { Speed } from '@common/enums/game-play/speed';

export interface TimerConfig {
    delay: number;
    speed: Speed;
    repeat: boolean;
}
