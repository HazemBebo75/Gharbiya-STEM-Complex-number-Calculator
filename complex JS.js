document.getElementById('calculateButton').addEventListener('click', function() {
    const inputType = document.getElementById('inputType').value;
    const complexInput = document.getElementById('complexInput').value;
    const output = document.getElementById('output');
    const buttonSound = document.getElementById('buttonSound');

    // Play sound
    buttonSound.currentTime = 0; // Reset sound
    buttonSound.play();

    // Convert based on input type
    let result = '';
    switch (inputType) {
        case 'algebraic':
            result = convertAlgebraic(complexInput);
            break;
        case 'polar':
            result = convertPolar(complexInput);
            break;
        case 'euler':
            result = convertEuler(complexInput);
            break;
        default:
            result = 'Invalid input type';
    }

    output.textContent = result;
});

function convertAlgebraic(input) {
    const regex = /^(-?\d+(\.\d+)?) \+ (-?\d+(\.\d+)?)i$/;
    const match = input.match(regex);
    if (match) {
        const a = parseFloat(match[1]);
        const b = parseFloat(match[3]);
        const r = Math.sqrt(a * a + b * b);
        const theta = Math.atan2(b, a);
        return `Polar: ${r.toFixed(2)}∠${theta / Math.PI}π\nEuler: ${r.toFixed(2)}e^(i${theta / Math.PI}π)`;
    } else {
        return 'Invalid Algebraic format. Use "a + bi".';
    }
}

function convertPolar(input) {
    // Adjust regex to accept radians in both numeric and π formats
    const regex = /^(-?\d+(\.\d+)?), (-?\d+(\.\d+)?(\/\d+)?π?|[-+]?\d+(\.\d+)?)$/;
    const match = input.match(regex);

    if (match) {
        const r = parseFloat(match[1]);
        let thetaString = match[3]; // Extract the angle part as a string
        let thetaRadians = 0;

        // Check if the angle is in terms of π
        if (thetaString.includes('π')) {
            // Replace "π" with Math.PI and evaluate
            thetaString = thetaString.replace('π', `*${Math.PI}`);
            thetaRadians = eval(thetaString); // Convert the π term into a number
        } else {
            thetaRadians = parseFloat(thetaString); // Direct numeric input in radians
        }

        // Convert theta to terms of π
        let thetaInPi = thetaRadians / Math.PI; // Get the value in terms of π
        let thetaInPiString = '';

        if (thetaInPi === 0) {
            thetaInPiString = '0';
        } else if (thetaInPi === 1) {
            thetaInPiString = 'π';
        } else if (thetaInPi === -1) {
            thetaInPiString = '-π';
        } else {
            thetaInPiString = `${thetaInPi.toFixed(2)}π`;
        }

        return `Algebraic: ${r * Math.cos(thetaRadians).toFixed(2)} + ${r * Math.sin(thetaRadians).toFixed(2)}i\nEuler: ${r.toFixed(2)}e^(i${thetaInPi.toFixed(2)}π)\nPolar: ${r.toFixed(2)}(cos(${thetaInPiString}) + i sin(${thetaInPiString}))`;
    } else {
        return 'Invalid Polar format. Use "r, θ", where θ can be in numeric radians or terms of π.';
    }
}


function convertEuler(input) {
    // Updated regex to match Euler form re^(iθ) where θ is in terms of π
    const regex = /^(-?\d+(?:\.\d+)?)e\^\(i(-?\d+(?:\.\d+)?)π\)$/;
    const match = input.match(regex);
    
    if (match) {
        const r = parseFloat(match[1]); // Magnitude
        const thetaInPi = parseFloat(match[2]); // Angle in terms of π

        // Convert to radians
        const theta = thetaInPi * Math.PI;

        // Convert to algebraic form
        const a = r * Math.cos(theta); // Real part
        const b = r * Math.sin(theta); // Imaginary part

        // Format θ as a multiple of π
        let thetaString = '';
        if (thetaInPi === 0) {
            thetaString = '0';
        } else if (thetaInPi === 1) {
            thetaString = 'π';
        } else if (thetaInPi === -1) {
            thetaString = '-π';
        } else {
            thetaString = `${thetaInPi.toFixed(2)}π`;
        }

        return `Algebraic: ${a.toFixed(2)} + ${b.toFixed(2)}i\nPolar: ${r.toFixed(2)}∠${thetaInPi.toFixed(2)}π\nEuler: ${r.toFixed(2)}e^(i${thetaString})`;
    } else {
        return 'Invalid Euler format. Use the form re^(iθ), where θ is in terms of π.';
    }
}


document.getElementById('OperationButton').addEventListener('click', function () {
    const operation = document.getElementById('operationType').value;
    try {
        const z1 = parseComplex(document.getElementById('z1').value);
        const z2 = parseComplex(document.getElementById('z2').value);
        let result;

        switch (operation) {
            case 'add':
                result = addComplex(z1, z2);
                break;
            case 'substract':
                result = subtractComplex(z1, z2);
                break;
            case 'multiply':
                result = multiplyComplex(z1, z2);
                break;
            case 'divide':
                result = divideComplex(z1, z2);
                break;
            default:
                result = 'Invalid operation';
        }

        document.getElementById('OperationResults').textContent = `Euler: ${result.euler}\nRectangular: ${result.rectangular}`;
    } catch (error) {
        document.getElementById('OperationResults').textContent = `Error: ${error.message}`;
    }
});

function parseComplex(str) {
    str = str.trim();

    // Rectangular form: a + bi
    const rectRegex = /([-+]?\d*\.?\d*)\s*([-+]\s*\d*\.?\d*)i/;
    const rectMatch = str.match(rectRegex);
    if (rectMatch) {
        const real = parseFloat(rectMatch[1]) || 0;
        const imaginary = parseFloat(rectMatch[2].replace(/\s/g, '')) || 0;
        return { real, imaginary };
    }

    // Exponential form: r e^iθ
    const expRegex = /([-+]?\d*\.?\d*)e\^?\(\s*i([-+]?[\d.]*)(π)?\)/;
    const expMatch = str.match(expRegex);
    if (expMatch) {
        const r = parseFloat(expMatch[1]);
        let theta = parseFloat(expMatch[2]);
        if (expMatch[3] === "π") { // Multiply by π if "π" is present
            theta *= Math.PI;
        }
        const real = r * Math.cos(theta);
        const imaginary = r * Math.sin(theta);
        return { real, imaginary };
    }

    // Polar form: r, θ
    const polarRegex = /([-+]?\d*\.?\d*),\s*([-+]?[\d.]*)(π)?/;
    const polarMatch = str.match(polarRegex);
    if (polarMatch) {
        const r = parseFloat(polarMatch[1]);
        let theta = parseFloat(polarMatch[2]);
        if (polarMatch[3] === "π") { // Multiply by π if "π" is present
            theta *= Math.PI;
        }
        const real = r * Math.cos(theta);
        const imaginary = r * Math.sin(theta);
        return { real, imaginary };
    }

    throw new Error('Invalid complex number format');
}

function toPolar(real, imaginary) {
    const r = Math.sqrt(real ** 2 + imaginary ** 2);
    let theta = Math.atan2(imaginary, real) / Math.PI; // Express theta in terms of π

    // Format theta as "nπ"
    let thetaString;
    if (theta === 0) {
        thetaString = "0";
    } else if (theta === 1) {
        thetaString = "π";
    } else if (theta === -1) {
        thetaString = "-π";
    } else {
        thetaString = `${theta.toFixed(2)}π`;
    }

    return `${r.toFixed(2)}e^(i${thetaString})`;
}

function addComplex(z1, z2) {
    const real = z1.real + z2.real;
    const imaginary = z1.imaginary + z2.imaginary;
    return {
        euler: toEuler(real, imaginary),
        rectangular: `${real.toFixed(2)} + ${imaginary.toFixed(2)}i`,
        polar: toPolar(real, imaginary)
    };
}

function subtractComplex(z1, z2) {
    const real = z1.real - z2.real;
    const imaginary = z1.imaginary - z2.imaginary;
    return {
        euler: toEuler(real, imaginary),
        rectangular: `${real.toFixed(2)} + ${imaginary.toFixed(2)}i`,
        polar: toPolar(real, imaginary)
    };
}

function multiplyComplex(z1, z2) {
    const real = z1.real * z2.real - z1.imaginary * z2.imaginary;
    const imaginary = z1.real * z2.imaginary + z1.imaginary * z2.real;
    return {
        euler: toEuler(real, imaginary),
        rectangular: `${real.toFixed(2)} + ${imaginary.toFixed(2)}i`,
        polar: toPolar(real, imaginary)
    };
}

function divideComplex(z1, z2) {
    const denominator = z2.real ** 2 + z2.imaginary ** 2;
    if (denominator === 0) {
        throw new Error('Cannot divide by zero');
    }
    const real = (z1.real * z2.real + z1.imaginary * z2.imaginary) / denominator;
    const imaginary = (z1.imaginary * z2.real - z1.real * z2.imaginary) / denominator;
    return {
        euler: toEuler(real, imaginary),
        rectangular: `${real.toFixed(2)} + ${imaginary.toFixed(2)}i`,
        polar: toPolar(real, imaginary)
    };
}

function toEuler(real, imaginary) {
    const r = Math.sqrt(real ** 2 + imaginary ** 2);
    let theta = Math.atan2(imaginary, real) / Math.PI; // Convert to π terms

    let thetaString;
    if (theta === 0) {
        thetaString = "0";
    } else if (theta === 1) {
        thetaString = "π";
    } else if (theta === -1) {
        thetaString = "-π";
    } else {
        thetaString = `${theta.toFixed(2)}π`;
    }

    return `${r.toFixed(2)}e^(i${thetaString})`;
}








document.getElementById('PowerButton').addEventListener('click', function() {
    const complexInput = document.getElementById('z power complex number').value;
    const power = parseInt(document.getElementById('power').value, 10);
    const result = calculateComplexPower(complexInput, power);
    document.getElementById('PowerResults').textContent = result;
});
function calculateComplexPower(input, n) {
    let r, theta, a, b;

    // Parse input in different formats (rectangular, polar, or Euler)
      // Regular expressions to match the new formats
      const regexRectangular = /^(-?\d+(?:\.\d+)?)(?:\s?\+\s?)(\d+(?:\.\d+)?)i$/;
      const regexPolar = /^(-?\d+(?:\.\d+)?),\s(-?\d+(?:\.\d+)?)(?:π)$/;
      const regexEuler = /^(-?\d+(?:\.\d+)?)(?:e\^\(i)(-?\d+(?:\.\d+)?)(?:π\))$/;
  
      let match = input.match(regexRectangular); // Check for rectangular form (a + bi)
      if (match) {
          a = parseFloat(match[1]); // Real part
          b = parseFloat(match[2]); // Imaginary part
          r = Math.sqrt(a * a + b * b); // Magnitude
          theta = Math.atan2(b, a); // Angle in radians
      } else if ((match = input.match(regexPolar)) || (match = input.match(regexEuler))) { // Check for polar or Euler form
          r = parseFloat(match[1]); // Magnitude
          theta = parseFloat(match[2]) * Math.PI; // Convert angle to radians
          a = r * Math.cos(theta); // Real part
          b = r * Math.sin(theta); // Imaginary part
      } else {
          return 'Invalid complex number format.';
      }
  
      // Perform the power calculation (raise the amplitude to the power n, multiply angle by n)
      const rPower = Math.pow(r, n); // New magnitude
      const thetaPower = theta * n; // New angle
  
      // Convert the result into rectangular form
      const realResult = rPower * Math.cos(thetaPower);
      const imaginaryResult = rPower * Math.sin(thetaPower);
  
      // Calculate the amplitude and angle in terms of π
      const amplitude = rPower.toFixed(2);
      const angleInPi = thetaPower / Math.PI; // Convert angle to terms of π
      let angleString = '';
  
      if (angleInPi === 0) {
          angleString = '0';
      } else if (angleInPi === 1) {
          angleString = 'π';
      } else if (angleInPi === -1) {
          angleString = '-π';
      } else {
          angleString = `${angleInPi.toFixed(2)}π`;
      }
  
      // Convert the result into all three forms (rectangular, polar, Euler)
      const rectangular = `${realResult.toFixed(2)} + ${imaginaryResult.toFixed(2)}i`;
      const polar = `${rPower.toFixed(2)}, ${angleInPi.toFixed(2)}π`;
      const euler = `${rPower.toFixed(2)}e^(i${angleString})`;
  
      return `
          Amplitude: ${amplitude}
          Angle: ${angleString}π
          Rectangular: ${rectangular}
          Polar: ${polar}
          Euler: ${euler}
      `;
  }