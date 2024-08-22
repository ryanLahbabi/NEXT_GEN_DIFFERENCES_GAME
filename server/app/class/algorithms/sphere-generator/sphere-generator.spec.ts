import SphereGenerator from './sphere-generator';
import * as validSpheres from './valid-spheres.json';

describe('SphereGenerator', () => {
    describe('generate', () => {
        it('should generate valid spheres', () => {
            for (const validSphere of validSpheres) {
                const generatedSphere = SphereGenerator.generate(validSphere.radius);
                expect(generatedSphere).toEqual(validSphere);
            }
        });

        it('should modify passed radius to fit criteria', () => {
            const badRadius = -3.3;
            const adjustedRadius = 3;
            const generatedSphere = SphereGenerator.generate(badRadius);
            expect(generatedSphere.radius).toEqual(adjustedRadius);
        });
    });
});
