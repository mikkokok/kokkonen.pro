import {orange} from '@mui/material/colors';
import {createTheme} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
    palette: {
      primary: {
        main: string;
        contrastText: string;
      };
      secondary: {
        main: string;
        contrastText: string;
      };
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
    paletteOptions?: {
      primary?: {
        main?: string;
        contrastText?: string;
      };
      secondary?: {
        main?: string;
        contrastText?: string;
      };
    };
  }
}

const theme = createTheme({
  status: {
    danger: orange[500],
  },
  palette: {
    primary: {
      main: '#041f38ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      contrastText: '#ffffff',
    },
  },
});

export default theme;
